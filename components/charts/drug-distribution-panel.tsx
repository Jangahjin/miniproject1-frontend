"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

const ACCENT = "#2563eb";

// docs/API.md §8 GET /admin/stats/drugs/{drugId} 응답 형태 (DrugStatsResponse.java와 대응).
interface Bucket {
  bucketFrom: number;
  bucketTo: number;
  count: number;
}

interface RegionAvg {
  sido: string;
  sigungu: string;
  avgPrice: number;
  pharmacyCount: number;
}

interface National {
  avg: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
}

interface DrugStatsResponse {
  drug: { id: number; displayName: string; packageUnit: string };
  distribution: Bucket[];
  byRegion: RegionAvg[];
  national: National;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function DrugDistributionPanel() {
  const [query, setQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<DrugSummary | null>(null);

  const statsQuery = useQuery({
    queryKey: ["admin", "stats", "drug-distribution", selectedDrug?.id],
    queryFn: () =>
      apiFetch<DrugStatsResponse>(`/api/v1/admin/stats/drugs/${selectedDrug!.id}`, { auth: true }),
    enabled: selectedDrug !== null,
  });

  const isRedirecting = useAdminGuard(statsQuery.error);
  if (isRedirecting) return null;

  return (
    <div className="flex flex-col gap-4">
      {selectedDrug ? (
        <span className="flex w-fit items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-700">
          {selectedDrug.displayName} ({selectedDrug.packageUnit})
          <button
            type="button"
            onClick={() => setSelectedDrug(null)}
            aria-label="약품 선택 해제"
            className="text-blue-400 hover:text-blue-600"
          >
            ✕
          </button>
        </span>
      ) : (
        <div className="max-w-sm">
          <DrugAutocomplete
            value={query}
            onChange={setQuery}
            onSelect={(drug) => {
              setSelectedDrug(drug);
              setQuery("");
            }}
            placeholder="통계를 볼 약품을 검색하세요"
          />
        </div>
      )}

      {selectedDrug === null && <EmptyState message="통계를 볼 약품을 선택하세요." />}

      {selectedDrug !== null && statsQuery.isLoading && <LoadingSkeleton />}

      {selectedDrug !== null && statsQuery.isError && (
        <ErrorState message="약품 통계를 불러오지 못했습니다." onRetry={() => statsQuery.refetch()} />
      )}

      {statsQuery.data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard label="전국 평균" value={statsQuery.data.national.avg != null ? formatPrice(statsQuery.data.national.avg) : "-"} />
            <StatCard label="중앙값" value={statsQuery.data.national.median != null ? formatPrice(statsQuery.data.national.median) : "-"} />
            <StatCard label="최저가" value={statsQuery.data.national.min != null ? formatPrice(statsQuery.data.national.min) : "-"} />
            <StatCard label="최고가" value={statsQuery.data.national.max != null ? formatPrice(statsQuery.data.national.max) : "-"} />
            <StatCard label="표준편차" value={statsQuery.data.national.stdDev != null ? formatPrice(statsQuery.data.national.stdDev) : "-"} />
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">가격 분포</h3>
            {statsQuery.data.distribution.length === 0 ? (
              <EmptyState message="가격 데이터가 없습니다." />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={statsQuery.data.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={(bucket: Bucket) => `${bucket.bucketFrom.toLocaleString("ko-KR")}~${bucket.bucketTo.toLocaleString("ko-KR")}`}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(value) => [`${value}건`, "약국 수"]} />
                  <Bar dataKey="count" fill={ACCENT}>
                    <LabelList dataKey="count" position="top" style={{ fontSize: 11 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">지역별 평균가</h3>
            {statsQuery.data.byRegion.length === 0 ? (
              <EmptyState message="지역별 데이터가 없습니다." />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={statsQuery.data.byRegion} margin={{ bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={(region: RegionAvg) => region.sigungu}
                    tick={{ fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip
                    formatter={(value) => [formatPrice(Number(value)), "평균가"]}
                    labelFormatter={(_label, payload) => {
                      const region = payload?.[0]?.payload as RegionAvg | undefined;
                      return region ? `${region.sido} ${region.sigungu}` : "";
                    }}
                  />
                  <Bar dataKey="avgPrice" fill={ACCENT}>
                    <LabelList
                      dataKey="avgPrice"
                      position="top"
                      style={{ fontSize: 10 }}
                      formatter={(value) => (typeof value === "number" ? value.toLocaleString("ko-KR") : value)}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </>
      )}
    </div>
  );
}
