import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RegionStatsPanel } from "@/components/charts/region-stats-panel";

export default function AdminRegionStatsPage() {
  return (
    <>
      <AdminPageHeader title="지역별 통계" description="시군구·약품별 평균가와 최저·최고가를 비교합니다. 열 제목을 누르면 정렬됩니다." />
      <RegionStatsPanel />
    </>
  );
}
