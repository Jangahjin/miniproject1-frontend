import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// 서버 컴포넌트(app/pharmacies/[id]/page.tsx)가 fetch하는 동안 Next.js가 자동으로
// 이 UI를 보여준다 (docs/ROADMAP.md T-36).
export default function PharmacyDetailLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <LoadingSkeleton />
    </div>
  );
}
