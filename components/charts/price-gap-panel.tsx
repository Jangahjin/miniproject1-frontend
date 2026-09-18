"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// docs/API.md §8 GET /admin/stats/price-gaps 응답 형태 (PriceGapsResponse.java와 대응).
interface RegionAvg {
  sido: string;
  sigungu: string;
  avgPrice: number;
}

interface PriceGapRow {
  drug: { id: number; displayName: string };
  cheapestRegion: RegionAvg;
  priciestRegion: RegionAvg;
  gap: number;
  gapPct: number;
}

interface PriceGapsResponse {
  rows: PriceGapRow[];
}

export function PriceGapPanel() {
  const gapsQuery = useQuery({
    queryKey: ["admin", "stats", "price-gaps"],
    queryFn: () => apiFetch<PriceGapsResponse>("/api/v1/admin/stats/price-gaps?limit=10", { auth: true }),
  });

  const isRedirecting = useAdminGuard(gapsQuery.error);
  if (isRedirecting) return null;

  if (gapsQuery.isLoading) return <LoadingSkeleton />;

  if (gapsQuery.isError) {
    return <ErrorState message="가격 격차 통계를 불러오지 못했습니다." onRetry={() => gapsQuery.refetch()} />;
  }

  const rows = gapsQuery.data?.rows ?? [];
  if (rows.length === 0) return <EmptyState message="가격 격차 데이터가 없습니다." />;

  const maxGapPct = Math.max(...rows.map((row) => row.gapPct));

  return (
    <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
      {rows.map((row) => (
        <li key={row.drug.id} className="flex flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-gray-900">{row.drug.displayName}</p>
            <p className="shrink-0 text-sm font-semibold text-blue-600">{row.gapPct.toFixed(1)}%</p>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${maxGapPct > 0 ? (row.gapPct / maxGapPct) * 100 : 0}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">
            최저 {row.cheapestRegion.sido} {row.cheapestRegion.sigungu} ({formatPrice(row.cheapestRegion.avgPrice)}) →
            최고 {row.priciestRegion.sido} {row.priciestRegion.sigungu} ({formatPrice(row.priciestRegion.avgPrice)})
            <span className="text-gray-400"> · 격차 {formatPrice(row.gap)}</span>
          </p>
        </li>
      ))}
    </ul>
  );
}
