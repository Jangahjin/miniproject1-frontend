import { NextResponse, type NextRequest } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookie";

// Next.js 16부터 `middleware` 파일/함수명은 deprecated고 `proxy`로 대체됐다
// (node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md 참고).
// accessToken은 클라이언트 메모리(Redux)에만 있어 이 요청에는 실려오지 않는다.
// 여기서는 httpOnly refreshToken 쿠키의 존재 여부만으로 "로그인 상태일 가능성"을 판단한다.
// 실제 유효성(만료·revoke)은 백엔드 API 호출 시점에 401로 걸러진다.
export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(REFRESH_TOKEN_COOKIE);
  if (hasSession) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/reports/new", "/me", "/admin/:path*"],
};
