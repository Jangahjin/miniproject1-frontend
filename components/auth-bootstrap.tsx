"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { setSession } from "@/store/slices/auth-slice";

// 새로고침하면 accessToken(메모리)이 사라지므로, httpOnly refreshToken 쿠키가
// 남아있다면 조용히 세션을 복원한다. 실패해도 그냥 로그아웃 상태로 둔다.
export function AuthBootstrap() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (accessToken) return;

    fetch("/api/auth/refresh", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) dispatch(setSession({ accessToken: data.accessToken, user: data.user }));
      })
      .catch(() => {
        // 세션 복원 실패는 조용히 무시한다.
      });
    // 마운트 시 1회만 시도한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
