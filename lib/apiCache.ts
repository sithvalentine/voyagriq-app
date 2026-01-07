import { NextResponse } from 'next/server';
import { createHash } from 'crypto';

/**
 * Cache types for different API endpoints
 */
export type CacheType = 'private' | 'public';

/**
 * Generate ETag for response data
 * Uses SHA-256 hash of JSON stringified data
 */
export function generateETag(data: any): string {
  const content = JSON.stringify(data);
  const hash = createHash('sha256').update(content).digest('hex');
  return `W/"${hash.substring(0, 16)}"`;
}

/**
 * Add comprehensive caching headers to API response
 *
 * @param response - NextResponse object
 * @param cacheType - 'private' (user-specific) or 'public' (shared)
 * @param maxAge - Cache duration in seconds
 * @param data - Response data for ETag generation
 * @returns Modified NextResponse with cache headers
 */
export function addCacheHeaders(
  response: NextResponse,
  cacheType: CacheType,
  maxAge: number,
  data: any
): NextResponse {
  // Cache-Control header
  // private = browser cache only, public = shared caches (CDN)
  response.headers.set('Cache-Control', `${cacheType}, max-age=${maxAge}`);

  // ETag for cache validation (conditional requests)
  const etag = generateETag(data);
  response.headers.set('ETag', etag);

  // Last-Modified header
  response.headers.set('Last-Modified', new Date().toUTCString());

  // Vary header for proper cache key generation
  // Tells caches to consider these headers when storing/retrieving
  response.headers.set('Vary', 'Accept-Encoding, Authorization');

  return response;
}

/**
 * Check if client's cached version is still valid
 * Returns true if client should use cached version (304 Not Modified)
 *
 * @param request - Incoming request
 * @param etag - Current ETag value
 * @returns true if cache is valid
 */
export function isCacheValid(request: Request, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match');

  if (ifNoneMatch) {
    // Check if client's ETag matches current ETag
    return ifNoneMatch === etag;
  }

  return false;
}

/**
 * Recommended cache durations for different endpoint types
 */
export const CACHE_DURATIONS = {
  // Frequently changing data
  TRIPS_LIST: 60,           // 1 minute
  TRIP_DETAIL: 300,         // 5 minutes

  // Slowly changing aggregations
  VENDORS: 300,             // 5 minutes
  ANALYTICS_SUMMARY: 180,   // 3 minutes

  // Real-time data (no caching)
  ANALYTICS_LIVE: 0,        // No cache

  // Static reference data
  COUNTRIES_LIST: 86400,    // 24 hours
} as const;

/**
 * Create a cached JSON response
 * Convenience method that combines JSON creation and cache header addition
 *
 * @param data - Response data
 * @param options - Cache options
 * @returns NextResponse with cache headers
 */
export function createCachedResponse(
  data: any,
  options: {
    cacheType?: CacheType;
    maxAge?: number;
    status?: number;
  } = {}
): NextResponse {
  const {
    cacheType = 'private',
    maxAge = 60,
    status = 200,
  } = options;

  const response = NextResponse.json(data, { status });

  if (maxAge > 0) {
    addCacheHeaders(response, cacheType, maxAge, data);
  } else {
    // Explicitly disable caching for real-time data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }

  return response;
}

/**
 * Handle conditional request (304 Not Modified)
 * Returns 304 response if cache is valid
 *
 * @param request - Incoming request
 * @param data - Current data
 * @returns NextResponse with 304 or null if cache invalid
 */
export function handleConditionalRequest(
  request: Request,
  data: any
): NextResponse | null {
  const etag = generateETag(data);

  if (isCacheValid(request, etag)) {
    const response = new NextResponse(null, { status: 304 });
    response.headers.set('ETag', etag);
    return response;
  }

  return null;
}
