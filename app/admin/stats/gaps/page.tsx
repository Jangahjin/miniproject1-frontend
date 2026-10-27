import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PriceGapPanel } from "@/components/charts/price-gap-panel";

export default function AdminPriceGapPage() {
  return (
    <>
      <AdminPageHeader title="가격 격차 Top 10" description="지역 간 평균가 차이가 가장 큰 약품 10개입니다. 막대 길이는 1위 대비 상대 크기입니다." />
      <PriceGapPanel />
    </>
  );
}
