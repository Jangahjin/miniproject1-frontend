import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// 서버 컴포넌트(app/search/page.tsx)가 fetch하는 동안 Next.js가 자동으로 이 UI를
// 보여준다 — 느린 네트워크에서 흰 화면으로 멈춰 보이지 않게 한다 (docs/ROADMAP.md T-36).
export default function SearchLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-6 w-48 animate-pulse rounded bg-gray-200" />
      <LoadingSkeleton />
    </div>
  );
}
