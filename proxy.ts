import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookie";

// accessToken은 Redux(메모리)에만 있어 proxy(서버 경계)에서는 볼 수 없다.
// 로그인 여부의 서버 사이드 신호는 httpOnly refreshToken 쿠키뿐이다 — 쿠키가
// 만료/revoke됐는데 남아있는 경우는 클라이언트의 401 인터셉터가 처리한다
// (docs/ROADMAP.md T-25). Next.js 16부터 middleware.ts는 proxy.ts로 대체됐다.
const PROTECTED_PATHS = ["/reports/new", "/me", "/admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  if (!isProtected) return NextResponse.next();

  if (request.cookies.has(REFRESH_TOKEN_COOKIE)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/reports/new/:path*", "/me/:path*", "/admin/:path*"],
};
