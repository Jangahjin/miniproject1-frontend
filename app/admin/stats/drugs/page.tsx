import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DrugDistributionPanel } from "@/components/charts/drug-distribution-panel";

export default function AdminDrugStatsPage() {
  return (
    <>
      <AdminPageHeader title="약품별 분포" description="약품 하나를 골라 약국별 가격 분포와 지역별 평균가를 확인합니다." />
      <DrugDistributionPanel />
    </>
  );
}
