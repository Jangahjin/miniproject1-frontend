"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

// docs/API.md §7 GET /regions 응답 형태 (region-picker.tsx와 동일 엔드포인트).
interface Sigungu {
  code: string;
  sigungu: string;
  pharmacyCount: number;
}

interface RegionGroup {
  sido: string;
  sigungus: Sigungu[];
}

// docs/API.md §8 GET /admin/stats/regions 응답 형태 (RegionStatsResponse.java와 대응).
interface RegionStatsRow {
  region: { code: string; sido: string; sigungu: string };
  drug: { id: number; displayName: string };
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  pharmacyCount: number;
  reportCount: number;
}

interface RegionStatsResponse {
  rows: RegionStatsRow[];
}

type SortKey = "region" | "drug" | "avgPrice" | "minPrice" | "maxPrice" | "pharmacyCount" | "reportCount";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "region", label: "지역" },
  { key: "drug", label: "약품" },
  { key: "avgPrice", label: "평균가" },
  { key: "minPrice", label: "최저가" },
  { key: "maxPrice", label: "최고가" },
  { key: "pharmacyCount", label: "약국수" },
  { key: "reportCount", label: "제보수" },
];

function sortValue(row: RegionStatsRow, key: SortKey): string | number {
  switch (key) {
    case "region":
      return `${row.region.sido} ${row.region.sigungu}`;
    case "drug":
      return row.drug.displayName;
    default:
      return row[key];
  }
}

export function RegionStatsPanel() {
  const [sido, setSido] = useState("");
  const [regionCode, setRegionCode] = useState("");
  const [drugQuery, setDrugQuery] = useState("");
  const [selectedDrug, setSelectedDrug] = useState<DrugSummary | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("avgPrice");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const regionsQuery = useQuery({
    queryKey: ["regions"],
    queryFn: () => apiFetch<RegionGroup[]>("/api/v1/regions"),
    staleTime: Infinity,
  });

  const sigunguOptions = useMemo(
    () => regionsQuery.data?.find((group) => group.sido === sido)?.sigungus ?? [],
    [regionsQuery.data, sido]
  );

  const params = new URLSearchParams();
  if (regionCode) params.set("regionCode", regionCode);
  if (sido) params.set("sido", sido);
  if (selectedDrug) params.set("drugId", String(selectedDrug.id));

  const statsQuery = useQuery({
    queryKey: ["admin", "stats", "regions", regionCode, sido, selectedDrug?.id],
    queryFn: () =>
      apiFetch<RegionStatsResponse>(`/api/v1/admin/stats/regions?${params.toString()}`, { auth: true }),
  });

  const isRedirecting = useAdminGuard(statsQuery.error);

  const sortedRows = useMemo(() => {
    const rows = statsQuery.data?.rows ?? [];
    const sorted = [...rows].sort((a, b) => {
      const av = sortValue(a, sortKey);
      const bv = sortValue(b, sortKey);
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv), "ko-KR");
    });
    if (sortDir === "desc") sorted.reverse();
    return sorted;
  }, [statsQuery.data, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  if (isRedirecting) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sido}
          onChange={(event) => {
            setSido(event.target.value);
            setRegionCode("");
          }}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">전체 시도</option>
          {regionsQuery.data?.map((group) => (
            <option key={group.sido} value={group.sido}>
              {group.sido}
            </option>
          ))}
        </select>

        <select
          value={regionCode}
          onChange={(event) => setRegionCode(event.target.value)}
          disabled={!sido}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
        >
          <option value="">전체 시군구</option>
          {sigunguOptions.map((sigungu) => (
            <option key={sigungu.code} value={sigungu.code}>
              {sigungu.sigungu}
            </option>
          ))}
        </select>

        {selectedDrug ? (
          <span className="flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-sm text-blue-700">
            {selectedDrug.displayName}
            <button
              type="button"
              onClick={() => setSelectedDrug(null)}
              aria-label="약품 필터 해제"
              className="text-blue-400 hover:text-blue-600"
            >
              ✕
            </button>
          </span>
        ) : (
          <div className="w-56">
            <DrugAutocomplete
              value={drugQuery}
              onChange={setDrugQuery}
              onSelect={(drug) => {
                setSelectedDrug(drug);
                setDrugQuery("");
              }}
              placeholder="약품으로 좁히기"
            />
          </div>
        )}
      </div>

      {statsQuery.isLoading ? (
        <LoadingSkeleton />
      ) : statsQuery.isError ? (
        <ErrorState message="통계를 불러오지 못했습니다." onRetry={() => statsQuery.refetch()} />
      ) : sortedRows.length === 0 ? (
        <EmptyState message="조건에 맞는 통계가 없습니다." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.key} className="whitespace-nowrap px-3 py-2 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="flex items-center gap-1 hover:text-gray-900"
                    >
                      {column.label}
                      {sortKey === column.key && <span>{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedRows.map((row, index) => (
                <tr key={`${row.region.code}-${row.drug.id}-${index}`} className="text-gray-700">
                  <td className="whitespace-nowrap px-3 py-2">
                    {row.region.sido} {row.region.sigungu}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{row.drug.displayName}</td>
                  <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">
                    {formatPrice(row.avgPrice)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{formatPrice(row.minPrice)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{formatPrice(row.maxPrice)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{row.pharmacyCount}</td>
                  <td className="whitespace-nowrap px-3 py-2">{row.reportCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
