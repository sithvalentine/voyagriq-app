/**
 * Simple in-memory rate limiter for API routes
 *
 * IMPORTANT: This is a basic implementation suitable for single-server deployments.
 * For production with multiple servers, consider:
 * - Vercel Edge Config: https://vercel.com/docs/storage/edge-config
 * - Upstash Redis: https://upstash.com/
 * - @upstash/ratelimit package
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof window === 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (IP address, user ID, API key, etc.)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(identifier: string, limit: number, windowMs: number): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // No previous requests or window has expired
    if (!entry || now >= entry.resetTime) {
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    // Within the time window
    if (entry.count < limit) {
      entry.count++;
      return {
        allowed: true,
        remaining: limit - entry.count,
        resetTime: entry.resetTime,
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Clear all rate limit data (useful for testing)
   */
  reset() {
    this.requests.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration presets
 */
export const RATE_LIMITS = {
  // API endpoints (per user or API key)
  API_PER_USER: {
    limit: 1000,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Public endpoints (per IP)
  PUBLIC_PER_IP: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
  },

  // Authentication endpoints (per IP)
  AUTH_PER_IP: {
    limit: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },

  // Bulk operations (per user)
  BULK_PER_USER: {
    limit: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers that might contain the real IP
  const headers = new Headers(request.headers);

  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    'unknown'
  );
}

/**
 * Check rate limit and return appropriate response
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  headers: Record<string, string>;
} {
  const result = rateLimiter.check(identifier, limit, windowMs);

  return {
    ...result,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': result.resetTime.toString(),
    },
  };
}

export default rateLimiter;
