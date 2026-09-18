"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { apiFetch, ApiError } from "@/lib/api";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// docs/API.md §8 GET /admin/stats/overview 응답 형태.
interface AdminOverviewResponse {
  totals: {
    pharmacyCount: number;
    drugCount: number;
    reportCount: number;
    userCount: number;
    coveredPairCount: number;
  };
  recentTrend: { date: string; reportCount: number }[];
  flaggedReportCount: number;
  coverageRate: number;
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => apiFetch<AdminOverviewResponse>("/api/v1/admin/stats/overview", { auth: true }),
    retry: false,
  });

  // ADMIN이 아니면 403이 온다 — 관리자 메뉴 자체를 헤더에 노출하지 않는 것과
  // 별개로, 링크를 직접 쳐서 들어온 경우까지 막아야 한다 (docs/ROADMAP.md T-33).
  useEffect(() => {
    if (overviewQuery.error instanceof ApiError && overviewQuery.error.status === 403) {
      router.replace("/");
    }
  }, [overviewQuery.error, router]);

  if (overviewQuery.isLoading) return <LoadingSkeleton />;

  if (overviewQuery.isError) {
    if (overviewQuery.error instanceof ApiError && overviewQuery.error.status === 403) {
      return null; // 리다이렉트 중
    }
    return <ErrorState message="통계를 불러오지 못했습니다." onRetry={() => overviewQuery.refetch()} />;
  }

  const data = overviewQuery.data;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">관리자 대시보드</h1>
        <div className="flex gap-4">
          <Link href="/admin/stats" className="text-sm font-medium text-blue-600 hover:underline">
            통계 상세 →
          </Link>
          <Link href="/admin/reports" className="text-sm font-medium text-blue-600 hover:underline">
            이상치 제보 관리 →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiCard label="약국 수" value={data.totals.pharmacyCount.toLocaleString("ko-KR")} />
        <KpiCard label="약품 수" value={data.totals.drugCount.toLocaleString("ko-KR")} />
        <KpiCard label="제보 수" value={data.totals.reportCount.toLocaleString("ko-KR")} />
        <KpiCard label="커버리지" value={`${Math.round(data.coverageRate * 100)}%`} />
        <KpiCard label="이상치 제보" value={data.flaggedReportCount.toLocaleString("ko-KR")} />
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">최근 7일 제보 추이</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.recentTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} />
            <YAxis allowDecimals={false} />
            <Tooltip labelFormatter={(value) => `${value}`} formatter={(value) => [`${value}건`, "제보 수"]} />
            <Line type="monotone" dataKey="reportCount" stroke="#2563eb" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
