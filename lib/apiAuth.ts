// API Authentication and Authorization
import { NextRequest } from 'next/server';
import { getServiceRoleClient } from './supabase';
import { createHash, randomBytes } from 'crypto';

export interface APIKey {
  id: string;
  key?: string; // Only populated when creating new key
  key_hash?: string;
  key_prefix: string;
  name: string;
  user_id: string;
  created_at: Date;
  last_used_at: Date | null;
  requests_count: number;
  rate_limit: number; // requests per hour
  is_active: boolean;
}

// Hash API key using SHA-256
function hashAPIKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

// Generate a new API key
function generateAPIKey(): string {
  const randomStr = randomBytes(24).toString('hex');
  return `tci_${randomStr}`;
}

// Rate limiting store (key_hash -> [timestamp, count][])
// Note: In production with multiple servers, use Redis or similar
const rateLimitStore: Map<string, number[]> = new Map();

/**
 * Validate API key from request headers
 */
export async function validateAPIKey(request: NextRequest): Promise<{ valid: boolean; apiKey?: APIKey; error?: string }> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  // Expected format: "Bearer <api_key>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { valid: false, error: 'Invalid Authorization header format. Expected: Bearer <api_key>' };
  }

  const key = parts[1];
  const keyHash = hashAPIKey(key);

  // Look up API key in database using service role client
  const supabase = getServiceRoleClient();
  const { data: apiKeyData, error } = await supabase
    .from('api_keys')
    .select(`
      *,
      profiles:user_id (subscription_tier)
    `)
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single();

  if (error || !apiKeyData) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check if user has Premium tier (API access is Premium-only)
  const profile = apiKeyData.profiles as any;
  if (profile?.subscription_tier !== 'premium') {
    return { valid: false, error: 'API access is only available on Premium plan' };
  }

  // Convert to APIKey format
  const apiKey: APIKey = {
    id: apiKeyData.id,
    key_hash: apiKeyData.key_hash,
    key_prefix: apiKeyData.key_prefix,
    name: apiKeyData.name,
    user_id: apiKeyData.user_id,
    created_at: new Date(apiKeyData.created_at),
    last_used_at: apiKeyData.last_used_at ? new Date(apiKeyData.last_used_at) : null,
    requests_count: apiKeyData.requests_count,
    rate_limit: apiKeyData.rate_limit,
    is_active: apiKeyData.is_active,
  };

  return { valid: true, apiKey };
}

/**
 * Check rate limit for an API key
 */
export async function checkRateLimit(apiKey: APIKey): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);

  // Get or initialize request timestamps for this key
  let requests = rateLimitStore.get(apiKey.key_hash!) || [];

  // Remove requests older than 1 hour
  requests = requests.filter(timestamp => timestamp > oneHourAgo);

  // Check if under limit
  const allowed = requests.length < apiKey.rate_limit;
  const remaining = Math.max(0, apiKey.rate_limit - requests.length);

  // If allowed, add current request and update database
  if (allowed) {
    requests.push(now);
    rateLimitStore.set(apiKey.key_hash!, requests);

    // Update API key stats in database
    const supabase = getServiceRoleClient();
    await supabase
      .from('api_keys')
      .update({
        requests_count: apiKey.requests_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', apiKey.id);
  }

  // Calculate reset time (1 hour from oldest request, or now if empty)
  const oldestRequest = requests.length > 0 ? Math.min(...requests) : now;
  const resetAt = new Date(oldestRequest + (60 * 60 * 1000));

  return { allowed, remaining, resetAt };
}

/**
 * Create a new API key
 */
export async function createAPIKey(name: string, userId: string): Promise<APIKey> {
  const key = generateAPIKey();
  const keyHash = hashAPIKey(key);
  const keyPrefix = key.substring(0, 12); // "tci_abc123..."

  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      rate_limit: 1000, // Premium tier default
      is_active: true,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create API key: ${error?.message}`);
  }

  return {
    id: data.id,
    key, // Only time we return the actual key
    key_prefix: data.key_prefix,
    name: data.name,
    user_id: data.user_id,
    created_at: new Date(data.created_at),
    last_used_at: null,
    requests_count: 0,
    rate_limit: data.rate_limit,
    is_active: data.is_active,
  };
}

/**
 * Delete an API key
 */
export async function deleteAPIKey(keyId: string, userId: string): Promise<boolean> {
  const supabase = getServiceRoleClient();
  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', keyId)
    .eq('user_id', userId); // Ensure user can only delete their own keys

  return !error;
}

/**
 * Get all API keys for a user
 */
export async function getUserAPIKeys(userId: string): Promise<APIKey[]> {
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(row => ({
    id: row.id,
    key_prefix: row.key_prefix,
    name: row.name,
    user_id: row.user_id,
    created_at: new Date(row.created_at),
    last_used_at: row.last_used_at ? new Date(row.last_used_at) : null,
    requests_count: row.requests_count,
    rate_limit: row.rate_limit,
    is_active: row.is_active,
  }));
}

/**
 * Middleware to authenticate API requests
 */
export function withAuth(handler: (request: NextRequest, context: { apiKey: APIKey }) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    // Validate API key
    const { valid, apiKey, error } = await validateAPIKey(request);

    if (!valid || !apiKey) {
      return new Response(
        JSON.stringify({ error: error || 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    const { allowed, remaining, resetAt } = await checkRateLimit(apiKey);

    if (!allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          limit: apiKey.rate_limit,
          resetAt: resetAt.toISOString(),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': apiKey.rate_limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetAt.toISOString(),
          }
        }
      );
    }

    // Call the handler with authenticated context
    const response = await handler(request, { apiKey });

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', apiKey.rate_limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', resetAt.toISOString());

    return response;
  };
}
