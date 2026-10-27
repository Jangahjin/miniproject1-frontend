"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { refreshSession } from "@/lib/api";

// 새로고침하면 accessToken(메모리)이 사라지므로, httpOnly refreshToken 쿠키가
// 남아있다면 조용히 세션을 복원한다. 실패해도 그냥 로그아웃 상태로 둔다.
// 직접 fetch하지 않고 refreshSession()을 쓰는 이유: 같은 시점에 페이지의 API 호출도
// 401 재시도로 갱신을 시도할 수 있어, 갱신 요청을 하나로 합쳐야 토큰 회전 충돌이 안 난다.
export function AuthBootstrap() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) return;
    // 세션이 없는 익명 방문자에게도 200 + accessToken: null이 내려오고, 그땐 false로 끝난다.
    void refreshSession();
    // 마운트 시 1회만 시도한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
