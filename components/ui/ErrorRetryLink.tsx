"use client";

import { useRouter } from "next/navigation";

// components/ui/ErrorState.tsx와 동일한 마크업/스타일이지만, 서버 컴포넌트
// 페이지(app/search, app/pharmacies/[id])는 클라이언트 쪽에 refetch 함수가
// 없으므로 router.refresh()로 서버 fetch를 다시 실행한다 (docs/ROADMAP.md T-36).
export function ErrorRetryLink({ message }: { message: string }) {
  const router = useRouter();

  return (
    <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="rounded-none border-2 border-gray-950 bg-gray-950 px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-gray-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
      >
        다시 시도
      </button>
    </div>
  );
}
