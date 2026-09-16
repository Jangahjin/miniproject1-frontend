"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { PriceTag } from "@/components/ui/PriceTag";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ReceiptThumbnail } from "@/components/admin/receipt-thumbnail";

// docs/API.md §8 GET /admin/price-reports 목록 항목 형태.
interface AdminReportItem {
  id: number;
  pharmacy: { id: number; name: string };
  drug: { id: number; displayName: string; packageUnit: string };
  price: number;
  purchasedAt: string;
  reporter: { id: number; nickname: string; email: string } | null;
  flagReason: string | null;
  receiptFileId: number | null;
}

interface AdminReportListResponse {
  content: AdminReportItem[];
}

export default function AdminReportsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmTarget, setConfirmTarget] = useState<AdminReportItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // status=ACTIVE로 좁혀서 이미 숨김 처리된 건은 다시 보이지 않게 한다.
  const reportsQuery = useQuery({
    queryKey: ["admin", "price-reports", "flagged"],
    queryFn: () =>
      apiFetch<AdminReportListResponse>(
        "/api/v1/admin/price-reports?flagged=true&status=ACTIVE&size=50",
        { auth: true }
      ),
    retry: false,
  });

  useEffect(() => {
    if (reportsQuery.error instanceof ApiError && reportsQuery.error.status === 403) {
      router.replace("/");
    }
  }, [reportsQuery.error, router]);

  async function refreshAfterAction() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "price-reports"] }),
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] }),
    ]);
  }

  async function handleHide(report: AdminReportItem) {
    setActionError(null);
    try {
      await apiFetch(`/api/v1/admin/price-reports/${report.id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ status: "HIDDEN" }),
      });
      setConfirmTarget(null);
      await refreshAfterAction();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "처리에 실패했습니다.");
    }
  }

  async function handleRestore(report: AdminReportItem) {
    setActionError(null);
    try {
      await apiFetch(`/api/v1/admin/price-reports/${report.id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ flagged: false }),
      });
      await refreshAfterAction();
    } catch (error) {
      setActionError(error instanceof ApiError ? error.message : "처리에 실패했습니다.");
    }
  }

  if (reportsQuery.isLoading) return <LoadingSkeleton />;

  if (reportsQuery.isError) {
    if (reportsQuery.error instanceof ApiError && reportsQuery.error.status === 403) {
      return null; // 리다이렉트 중
    }
    return <ErrorState message="제보 목록을 불러오지 못했습니다." onRetry={() => reportsQuery.refetch()} />;
  }

  const reports = reportsQuery.data?.content ?? [];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-gray-900">이상치 제보 관리</h1>
      {actionError && (
        <p role="alert" className="text-sm text-red-600">
          {actionError}
        </p>
      )}

      {reports.length === 0 ? (
        <EmptyState message="검토가 필요한 이상치 제보가 없습니다." />
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {report.receiptFileId != null && <ReceiptThumbnail fileId={report.receiptFileId} />}
                <div>
                  <p className="font-medium text-gray-900">
                    {report.pharmacy.name} · {report.drug.displayName} ({report.drug.packageUnit})
                  </p>
                  <p className="text-sm">
                    <PriceTag price={report.price} /> <span className="text-gray-400">· {report.purchasedAt} 구매</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    제보자 {report.reporter?.nickname ?? "알 수 없음"} ({report.reporter?.email ?? "-"}) · 사유{" "}
                    {report.flagReason ?? "-"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(report)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  복구
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget(report)}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  숨김
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        title="제보를 숨기시겠습니까?"
        message={
          confirmTarget
            ? `${confirmTarget.pharmacy.name}의 ${confirmTarget.drug.displayName} 제보(${confirmTarget.price.toLocaleString("ko-KR")}원)를 숨김 처리합니다. 통계에서 즉시 제외됩니다.`
            : ""
        }
        confirmLabel="숨기기"
        onConfirm={() => confirmTarget && handleHide(confirmTarget)}
        onCancel={() => setConfirmTarget(null)}
      />
    </div>
  );
}
