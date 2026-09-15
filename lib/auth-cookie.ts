export const REFRESH_TOKEN_COOKIE = "refreshToken";

export const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 14, // 14일 — 백엔드 refreshToken 만료와 동일
};
