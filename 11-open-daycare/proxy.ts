import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

const publicRoutes = ['/login', '/activate'];

const staffRoutes = ['/staff'];
const familyRoutes = ['/family'];

function isStaffRoute(pathname: string) {
  return staffRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

function isFamilyRoute(pathname: string) {
  return familyRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

export async function proxy(request: NextRequest) {
  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/'),
  );

  if (isPublicRoute && user) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  if (!isPublicRoute && !user) {
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  if (!user) {
    return response;
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role as 'staff' | 'admin' | 'parent' | undefined;
  const isParent = role === 'parent';
  const isStaffOrAdmin = role === 'staff' || role === 'admin';

  if (pathname === '/' || pathname === '') {
    if (isParent) {
      const url = new URL('/family', request.url);
      return NextResponse.redirect(url);
    }
    if (isStaffOrAdmin) {
      const url = new URL('/staff', request.url);
      return NextResponse.redirect(url);
    }
  }

  if (isStaffRoute(pathname) && isParent) {
    const url = new URL('/family', request.url);
    return NextResponse.redirect(url);
  }

  if (isFamilyRoute(pathname) && isStaffOrAdmin) {
    const url = new URL('/staff', request.url);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.(?:png|svg|ico)$).*)'],
};
