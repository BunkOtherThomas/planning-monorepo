import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const allowedHeaders = [
  'content-type',
  'authorization'
];

const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': allowedHeaders.join(', '),
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Max-Age': '86400', // 24 hours
};

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
      status: 204,
      headers: corsHeaders
    });
  }

  // For all other requests, add CORS headers to the response
  const response = NextResponse.next();
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
}; 