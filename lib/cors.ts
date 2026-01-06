// CORS Configuration for API Routes
import { NextResponse } from 'next/server';

/**
 * Allowed origins for CORS
 * In production, only allow requests from your own domain
 * In development, allow localhost for testing
 */
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || 'https://voyagriq.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
  process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : null,
].filter(Boolean) as string[];

/**
 * Add CORS headers to a response
 * This allows API calls from browser-based clients (like frontend JavaScript)
 * while blocking unauthorized cross-origin requests
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // Check if origin is allowed
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    // Default to first allowed origin (same-origin in production)
    response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours

  return response;
}

/**
 * Handle OPTIONS preflight requests
 * Browsers send OPTIONS requests before actual requests for CORS
 */
export function handleCorsPreflightRequest(origin?: string | null): NextResponse {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, origin);
}

/**
 * Wrapper for API route handlers to add CORS support
 * Usage:
 *
 * export const GET = withCors(async (request) => {
 *   // Your handler logic
 *   return NextResponse.json({ data: 'example' });
 * });
 *
 * export const OPTIONS = corsPreflightHandler;
 */
export function withCors(
  handler: (request: Request) => Promise<NextResponse> | NextResponse
) {
  return async (request: Request): Promise<NextResponse> => {
    const origin = request.headers.get('origin');

    // Call the actual handler
    const response = await handler(request);

    // Add CORS headers to response
    return addCorsHeaders(response, origin);
  };
}

/**
 * Standard OPTIONS handler for preflight requests
 * Export this from your route files to handle CORS preflight
 */
export function corsPreflightHandler(request: Request): NextResponse {
  const origin = request.headers.get('origin');
  return handleCorsPreflightRequest(origin);
}
