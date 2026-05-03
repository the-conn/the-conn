import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'jefferies_session';

export function middleware(request: NextRequest) {
  if (request.cookies.has(COOKIE_NAME)) {
    return NextResponse.next();
  }
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '');
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  const target = `${apiBase}/api/auth/login?return_to=${encodeURIComponent(returnTo)}`;
  return NextResponse.redirect(target);
}

export const config = {
  matcher: ['/((?!api/|_next/static|_next/image|favicon.ico).*)'],
};
