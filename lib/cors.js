/**
 * CORS helper for API routes
 * Provides CORS headers for cross-origin requests
 */

export function corsHeaders(allowedOrigins = ['http://localhost:3000', 'http://localhost:3001']) {
  return {
    'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' ? 'https://yourfrontend.com' : 'http://localhost:3001',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

/**
 * Handle CORS preflight requests
 */
export function handleCORS(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }
}

/**
 * Wrap API response with CORS headers
 */
export function withCORSHeaders(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    headers.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
