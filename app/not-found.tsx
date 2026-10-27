import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="text-7xl font-extrabold tracking-[-0.04em] text-brand tabular-nums dark:text-sky-400">404</span>
      <h1 className="text-xl font-black text-gray-950">페이지를 찾을 수 없어요</h1>
      <p className="max-w-xs text-sm leading-relaxed text-gray-600">
        주소가 바뀌었거나 삭제된 페이지예요. 홈에서 다시 약을 검색해보세요.
      </p>
      <Link
        href="/"
        className="mt-2 btn-primary"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
