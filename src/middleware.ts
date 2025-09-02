import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get session from cookie (simplified for dev)
  const sessionCookie = request.cookies.get('venlyn-session');
  const isAuthenticated = !!sessionCookie;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/api/dev/login'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // API routes (except auth) require authentication
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/dev/login')) {
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  // App routes require authentication
  if (pathname.startsWith('/(app)') || pathname === '/overview' || 
      pathname.startsWith('/calls') || pathname.startsWith('/jobs') ||
      pathname.startsWith('/numbers') || pathname.startsWith('/settings') ||
      pathname.startsWith('/sops') || pathname.startsWith('/jarvis') ||
      pathname.startsWith('/a2p') || pathname.startsWith('/integrations')) {
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect authenticated users from root to overview
  if (pathname === '/' && isAuthenticated) {
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  // Redirect unauthenticated users from root to login
  if (pathname === '/' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};