import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookie";

// accessToken은 클라이언트 메모리(Redux)에만 있어 미들웨어(Edge)에서 볼 수 없다.
// 여기서는 httpOnly refreshToken 쿠키의 존재 여부만으로 "로그인 상태일 가능성"을 판단한다.
// 실제 유효성(만료·revoke)은 백엔드 API 호출 시점에 401로 걸러진다.
export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/reports/new", "/me", "/admin/:path*"],
};
