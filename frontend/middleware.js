import { NextResponse } from 'next/server';

/** Redirect mistaken admin URLs (without /admin prefix) to the correct admin routes. */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const url = request.nextUrl.clone();
    url.pathname = `/admin/dashboard${pathname.slice('/dashboard'.length)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === '/admin/login' || pathname.startsWith('/admin/')) {
    return NextResponse.next();
  }

  if (pathname === '/login' && request.nextUrl.searchParams.get('admin') === '1') {
    const url = request.nextUrl.clone();
    url.pathname = '/admin/login';
    url.searchParams.delete('admin');
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*', '/login'],
};
