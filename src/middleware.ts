import { NextResponse, type NextRequest } from 'next/server';

// This is a simple middleware to redirect unauthenticated users
// Note: In production, you'd verify the Firebase token here.
// For now, we rely on client-side protection in the pages for simplicity 
// and because Firebase token verification in Edge Middleware requires extra setup.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes
  if (pathname === '/' || pathname === '/login' || pathname === '/register' || pathname === '/contact' || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
