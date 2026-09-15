import { NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE_OPTIONS } from "@/lib/auth-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// refreshToken은 여기서만 다루고 브라우저 JS에는 절대 내려주지 않는다 (httpOnly 쿠키).
export async function POST(request: Request) {
  const body = await request.json();

  const backendRes = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const response = NextResponse.json({
    accessToken: data.accessToken,
    expiresIn: data.expiresIn,
    user: data.user,
  });
  response.cookies.set(REFRESH_TOKEN_COOKIE, data.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return response;
}
