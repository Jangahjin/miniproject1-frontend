import { redirect } from "next/navigation";

// 예전엔 이 주소 하나에 통계 3종이 탭으로 들어 있었다 — 이제 각각 별도 페이지로 나눴으므로,
// 기존 북마크·링크는 첫 번째 통계(지역별)로 보낸다.
export default function AdminStatsIndexPage() {
  redirect("/admin/stats/regions");
}
