"use client";

import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// GET /api/v1/uploads/{fileId}는 인증이 필요해서 <img src>로 바로 못 부른다
// (img 태그는 Authorization 헤더를 못 실어 보낸다) — 토큰을 실어 직접 fetch한 뒤
// blob을 object URL로 바꿔 렌더링한다.
export function ReceiptThumbnail({ fileId }: { fileId: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    (async () => {
      const { store } = await import("@/store");
      const token = store.getState().auth.accessToken;
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/uploads/${fileId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!res.ok) {
          if (!cancelled) setFailed(true);
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [fileId]);

  if (failed) {
    return <span className="text-xs text-gray-400">영수증 로드 실패</span>;
  }
  if (!url) {
    return <div className="h-12 w-12 shrink-0 animate-pulse rounded-lg bg-gray-200" aria-hidden="true" />;
  }
  // eslint-disable-next-line @next/next/no-img-element -- blob: object URL이라 next/image 최적화 대상이 아니다
  return <img src={url} alt="영수증" className="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover" />;
}
