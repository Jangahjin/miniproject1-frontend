import { ApiError } from "@/lib/api";

// 백엔드(docs/ROADMAP.md T-35)는 항상 한글 메시지를 주지만, 에러 바디가 JSON이
// 아닌 경우(lib/api.ts) code가 "UNKNOWN"으로 떨어지고 message는 res.statusText
// (영문)이다. 이 경우까지 폴백 문구로 막아 "Request failed with status 409" 같은
// 원문이 화면에 뜨지 않게 한다 (docs/ROADMAP.md T-36).
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.code !== "UNKNOWN") {
    return error.message;
  }
  return fallback;
}
