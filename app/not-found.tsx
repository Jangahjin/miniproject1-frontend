import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="font-serif text-7xl font-semibold text-sky-500 tabular-nums">404</span>
      <h1 className="text-xl font-black text-gray-950">페이지를 찾을 수 없어요</h1>
      <p className="max-w-xs text-sm leading-relaxed text-gray-600">
        주소가 바뀌었거나 삭제된 페이지예요. 홈에서 다시 약을 검색해보세요.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-none border-2 border-gray-950 bg-gray-950 px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
      >
        홈으로 가기
      </Link>
    </div>
  );
}
