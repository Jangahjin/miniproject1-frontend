"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PriceTag } from "@/components/ui/PriceTag";

// docs/API.md §2 GET /auth/me 응답 형태.
interface MeResponse {
  id: number;
  email: string;
  nickname: string;
  role: "USER" | "ADMIN";
  reportCount: number;
  createdAt: string;
}

// docs/API.md §6 GET /price-reports 목록 항목 형태 (mine=true).
interface PriceReportListItem {
  id: number;
  pharmacy: { id: number; name: string };
  drug: { id: number; displayName: string; packageUnit: string };
  price: number;
  purchasedAt: string;
  status: "ACTIVE" | "HIDDEN" | "REJECTED";
  flagged: boolean;
  createdAt: string;
}

interface PriceReportListResponse {
  content: PriceReportListItem[];
  totalElements: number;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "반영됨", className: "bg-green-100 text-green-700" },
  HIDDEN: { label: "숨김 처리됨", className: "bg-gray-100 text-gray-600" },
  REJECTED: { label: "반려됨", className: "bg-red-100 text-red-700" },
};

// flagged인 제보는 status와 무관하게 "검토 중"이 우선이다 — 통계에서 제외된 채
// 관리자 확인을 기다리는 중이라는 뜻이라, 사용자에게는 이게 더 정확한 정보다.
function statusBadgeFor(report: PriceReportListItem) {
  if (report.flagged) return { label: "검토 중", className: "bg-amber-100 text-amber-700" };
  return STATUS_BADGE[report.status] ?? { label: report.status, className: "bg-gray-100 text-gray-600" };
}

export default function MyReportsPage() {
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<MeResponse>("/api/v1/auth/me", { auth: true }),
  });
  const reportsQuery = useQuery({
    queryKey: ["price-reports", "mine"],
    queryFn: () =>
      apiFetch<PriceReportListResponse>("/api/v1/price-reports?mine=true&size=50", { auth: true }),
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-xl font-bold text-gray-900">내 제보</h1>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        {meQuery.isLoading ? (
          <LoadingSkeleton />
        ) : meQuery.isError ? (
          <ErrorState message="내 정보를 불러오지 못했습니다." onRetry={() => meQuery.refetch()} />
        ) : (
          <p className="text-sm text-gray-600">
            지금까지 총{" "}
            <span className="font-semibold text-gray-900">{meQuery.data?.reportCount ?? 0}건</span>의 가격을
            제보했습니다.
          </p>
        )}
      </section>

      {reportsQuery.isLoading ? (
        <LoadingSkeleton />
      ) : reportsQuery.isError ? (
        <ErrorState
          message={getErrorMessage(reportsQuery.error, "제보 목록을 불러오지 못했습니다.")}
          onRetry={() => reportsQuery.refetch()}
        />
      ) : reportsQuery.data?.content.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12">
          <EmptyState message="아직 제보한 가격이 없습니다." />
          <Link
            href="/reports/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            첫 가격을 제보해보세요
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {reportsQuery.data?.content.map((report) => {
            const badge = statusBadgeFor(report);
            return (
              <li key={report.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-gray-900">{report.pharmacy.name}</p>
                  <p className="text-sm text-gray-500">
                    {report.drug.displayName} ({report.drug.packageUnit})
                  </p>
                  <p className="text-xs text-gray-400">{report.purchasedAt} 구매</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriceTag price={report.price} />
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
