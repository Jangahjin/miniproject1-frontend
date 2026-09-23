"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PriceTag } from "@/components/ui/PriceTag";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

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
  ACTIVE: { label: "반영됨", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" },
  HIDDEN: { label: "숨김 처리됨", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" },
  REJECTED: { label: "반려됨", className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200" },
};

// flagged인 제보는 status와 무관하게 "검토 중"이 우선이다 — 통계에서 제외된 채
// 관리자 확인을 기다리는 중이라는 뜻이라, 사용자에게는 이게 더 정확한 정보다.
function statusBadgeFor(report: PriceReportListItem) {
  if (report.flagged) return { label: "검토 중", className: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200" };
  return STATUS_BADGE[report.status] ?? { label: report.status, className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300" };
}

export default function MyReportsPage() {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<PriceReportListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiFetch<MeResponse>("/api/v1/auth/me", { auth: true }),
  });
  const reportsQuery = useQuery({
    queryKey: ["price-reports", "mine"],
    queryFn: () =>
      apiFetch<PriceReportListResponse>("/api/v1/price-reports?mine=true&size=50", { auth: true }),
  });

  async function handleDelete(report: PriceReportListItem) {
    if (isDeleting) return;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await apiFetch(`/api/v1/price-reports/${report.id}`, { method: "DELETE", auth: true });
      setDeleteTarget(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["price-reports", "mine"] }),
        queryClient.invalidateQueries({ queryKey: ["me"] }),
      ]);
    } catch (error) {
      setDeleteError(getErrorMessage(error, "삭제에 실패했습니다."));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <h1 className="text-2xl font-black text-gray-950 dark:text-gray-50">내 제보</h1>

      {deleteError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {deleteError}
        </p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {meQuery.isLoading ? (
          <LoadingSkeleton />
        ) : meQuery.isError ? (
          <ErrorState message="내 정보를 불러오지 못했습니다." onRetry={() => meQuery.refetch()} />
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            지금까지 총{" "}
            <span className="font-semibold text-gray-900 dark:text-gray-100">{meQuery.data?.reportCount ?? 0}건</span>의 가격을
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
            className="rounded-none border-2 border-gray-950 bg-gray-950 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[3px_3px_0_0_#2563eb] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#2563eb] dark:border-gray-50 dark:bg-gray-50 dark:text-gray-950 dark:shadow-[3px_3px_0_0_#60a5fa] dark:hover:shadow-[5px_5px_0_0_#60a5fa]"
          >
            첫 가격을 제보해보세요
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
          {reportsQuery.data?.content.map((report) => {
            const badge = statusBadgeFor(report);
            return (
              <li key={report.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{report.pharmacy.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {report.drug.displayName} ({report.drug.packageUnit})
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{report.purchasedAt} 구매</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <PriceTag price={report.price} />
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(report)}
                    className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    삭제
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="제보를 삭제할까요?"
        message={
          deleteTarget
            ? `${deleteTarget.pharmacy.name}의 ${deleteTarget.drug.displayName} 제보(${deleteTarget.price.toLocaleString("ko-KR")}원)를 삭제합니다. 통계에서 즉시 제외되며 되돌릴 수 없습니다.`
            : ""
        }
        confirmLabel="삭제"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
