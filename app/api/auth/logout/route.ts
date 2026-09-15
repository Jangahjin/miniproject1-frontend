import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { REFRESH_TOKEN_COOKIE } from "@/lib/auth-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;
  const authHeader = request.headers.get("authorization");

  if (refreshToken) {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // 백엔드 호출이 실패해도 로그아웃은 진행한다 — 멱등해야 한다 (API.md §2 logout).
    }
  }

  const response = new NextResponse(null, { status: 204 });
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}
