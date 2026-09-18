"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";

// app/admin/page.tsx, app/admin/reports/page.tsx와 동일한 403 리다이렉트 패턴을
// 관리자 통계 탭 3곳에서 재사용하기 위해 추출했다.
export function useAdminGuard(error: unknown) {
  const router = useRouter();

  useEffect(() => {
    if (error instanceof ApiError && error.status === 403) {
      router.replace("/");
    }
  }, [error, router]);

  return error instanceof ApiError && error.status === 403;
}
