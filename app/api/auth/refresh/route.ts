import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS } from "@/lib/auth-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return NextResponse.json({ code: "UNAUTHENTICATED", message: "로그인이 필요합니다." }, { status: 401 });
  }

  const backendRes = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    const response = NextResponse.json(data, { status: backendRes.status });
    response.cookies.delete(REFRESH_TOKEN_COOKIE);
    return response;
  }

  // 토큰 회전(rotation): 기존 refreshToken은 백엔드에서 이미 revoke됐으므로 반드시 새 값으로 덮어쓴다.
  const response = NextResponse.json({
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    user: data.user,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return response;
}
