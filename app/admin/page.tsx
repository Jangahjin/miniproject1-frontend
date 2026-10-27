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

// href가 있으면 카드 전체가 해당 화면으로 가는 링크가 된다 (예: 이상치 제보 → 검토 화면).
// tone="alert"는 처리가 필요한 수치를 빨간 톤으로 구분한다.
function KpiCard({ label, value, href, tone }: { label: string; value: string; href?: string; tone?: "alert" }) {
  const body = (
    <>
      <p className={`text-xs font-semibold ${tone === "alert" ? "text-red-600 dark:text-red-400" : "text-sub dark:text-gray-400"}`}>{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold tracking-[-0.02em] text-ink tabular-nums dark:text-gray-50">{value}</p>
      {href && <p className="mt-1 text-xs font-semibold text-brand dark:text-sky-300">검토하기 →</p>}
    </>
  );
  const className = `card p-5 ${tone === "alert" ? "border-red-200 bg-red-50/50 dark:border-red-900/60 dark:bg-red-950/20" : ""}`;
  return href ? (
    <Link href={href} className={`${className} transition hover:-translate-y-0.5 hover:shadow-md`}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const gridStroke = "#e5e7eb";
  const tickColor = "#6b7280";
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
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">관리자 대시보드</h1>
        <div className="flex gap-4">
          <Link href="/admin/stats" className="text-sm font-medium text-brand hover:underline dark:text-sky-400">
            통계 상세 →
          </Link>
          <Link href="/admin/reports" className="text-sm font-medium text-brand hover:underline dark:text-sky-400">
            이상치 제보 관리 →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <KpiCard label="약국 수" value={data.totals.pharmacyCount.toLocaleString("ko-KR")} />
        <KpiCard label="약품 수" value={data.totals.drugCount.toLocaleString("ko-KR")} />
        <KpiCard label="제보 수" value={data.totals.reportCount.toLocaleString("ko-KR")} />
        <KpiCard label="커버리지" value={`${Math.round(data.coverageRate * 100)}%`} />
        <KpiCard
          label="이상치 제보"
          value={data.flaggedReportCount.toLocaleString("ko-KR")}
          href="/admin/reports"
          tone={data.flaggedReportCount > 0 ? "alert" : undefined}
        />
      </div>

      <section className="card relative p-5">
        <h2 className="mb-3 text-sm font-bold text-ink dark:text-gray-200">최근 7일 제보 추이</h2>
        {/* 전부 0이면 납작한 선만 보여 고장처럼 보이므로, 데이터가 없다는 사실을 글로 알려준다. */}
        {data.recentTrend.every((day) => day.reportCount === 0) && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 z-10 text-center text-sm text-sub dark:text-gray-400">
            최근 7일간 새로 들어온 제보가 없습니다.
          </p>
        )}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data.recentTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fill: tickColor, fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: tickColor, fontSize: 12 }} />
            <Tooltip
              labelFormatter={(value) => `${value}`}
              formatter={(value) => [`${value}건`, "제보 수"]}
            />
            <Line type="monotone" dataKey="reportCount" stroke="#1F3C66" strokeWidth={2} dot />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
