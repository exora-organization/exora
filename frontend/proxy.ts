import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/features",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/invite",
];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('firebaseToken')?.value;
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );

  const isAuthPage = pathname.startsWith('/login') || 
                     pathname.startsWith('/register') || 
                     pathname.startsWith('/reset-password');

  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }
  
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
