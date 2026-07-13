import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/services",
  "/projects",
  "/blog",
  "/features",
  "/contact",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/invite",
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseToken')?.value;
  const { pathname } = request.nextUrl;
  
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || (route !== "/" && pathname.startsWith(`${route}/`))
  );

  if (!token && !isPublicRoute) {
    const url = new URL('/login', request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)'],
};
