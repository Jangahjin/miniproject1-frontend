"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
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
  source: "SEED" | "USER";
  flagReason: string | null;
  receiptFileId: number | null;
}

interface AdminReportListResponse {
  content: AdminReportItem[];
  totalElements: number;
}

// 시드 제보는 제보자·사유가 원래 비어 있다(null) — "알 수 없음 (-) · 사유 -"처럼 빈 값을 대시로
// 늘어놓는 대신, 출처를 밝히고 값이 있는 항목만 보여준다.
function describeReport(report: AdminReportItem): string {
  const parts: string[] = [];
  if (report.reporter) parts.push(`제보자 ${report.reporter.nickname} (${report.reporter.email})`);
  else parts.push(report.source === "SEED" ? "시드 데이터" : "제보자 정보 없음");
  if (report.flagReason) parts.push(`사유 ${report.flagReason}`);
  return parts.join(" · ");
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
      setActionError(getErrorMessage(error, "처리에 실패했습니다."));
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
      setActionError(getErrorMessage(error, "처리에 실패했습니다."));
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
  const total = reportsQuery.data?.totalElements ?? reports.length;

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div className="flex flex-col gap-1">
        <Link href="/admin" className="w-fit text-sm text-sub hover:text-brand dark:text-gray-400 dark:hover:text-sky-300">
          ← 관리자 대시보드
        </Link>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">이상치 제보 관리</h1>
        {reports.length > 0 && (
          <p className="text-sm text-sub dark:text-gray-400">
            검토 대기 <b className="font-bold text-ink tabular-nums dark:text-gray-100">{total.toLocaleString("ko-KR")}</b>건
            {total > reports.length && ` 중 ${reports.length}건 표시`}
          </p>
        )}
      </div>
      {actionError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {actionError}
        </p>
      )}

      {reports.length === 0 ? (
        <EmptyState message="검토가 필요한 이상치 제보가 없습니다." />
      ) : (
        <ul className="card divide-y divide-line overflow-hidden dark:divide-gray-800">
          {reports.map((report) => (
            <li
              key={report.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                {report.receiptFileId != null && <ReceiptThumbnail fileId={report.receiptFileId} />}
                <div>
                  <p className="font-bold text-ink dark:text-gray-100">
                    {report.pharmacy.name} · {report.drug.displayName} ({report.drug.packageUnit})
                  </p>
                  <p className="text-sm">
                    <PriceTag price={report.price} /> <span className="text-sub dark:text-gray-400">· {report.purchasedAt} 구매</span>
                  </p>
                  <p className="mt-0.5 text-xs text-sub dark:text-gray-500">{describeReport(report)}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => handleRestore(report)}
                  className="btn-secondary px-4 py-2"
                >
                  복구
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmTarget(report)}
                  // 복구 버튼과 같은 크기(btn-secondary)에 위험 동작임을 빨간 톤으로만 구분한다.
                  className="btn-secondary border-red-200 px-4 py-2 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950 dark:hover:text-red-300"
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
