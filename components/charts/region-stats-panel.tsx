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

// numeric 열은 오른쪽 정렬 + 고정폭 숫자로 자릿수를 세로로 맞춰, 위아래 행의 크기 비교가 바로 되게 한다.
const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "region", label: "지역" },
  { key: "drug", label: "약품" },
  { key: "avgPrice", label: "평균가", numeric: true },
  { key: "minPrice", label: "최저가", numeric: true },
  { key: "maxPrice", label: "최고가", numeric: true },
  { key: "pharmacyCount", label: "약국수", numeric: true },
  { key: "reportCount", label: "제보수", numeric: true },
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
          className="input-field w-auto pr-8 text-sm"
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
          className="input-field w-auto pr-8 text-sm disabled:cursor-not-allowed disabled:bg-mist disabled:text-gray-400 dark:disabled:bg-gray-800 dark:disabled:text-gray-500"
        >
          <option value="">전체 시군구</option>
          {sigunguOptions.map((sigungu) => (
            <option key={sigungu.code} value={sigungu.code}>
              {sigungu.sigungu}
            </option>
          ))}
        </select>

        {selectedDrug ? (
          <span className="flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-sm font-semibold text-brand dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
            {selectedDrug.displayName}
            <button
              type="button"
              onClick={() => setSelectedDrug(null)}
              aria-label="약품 필터 해제"
              className="text-brand/60 hover:text-brand dark:text-sky-400/60 dark:hover:text-sky-300"
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
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line bg-mist text-sub dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                {COLUMNS.map((column) => (
                  <th key={column.key} className={`whitespace-nowrap px-4 py-2.5 font-semibold ${column.numeric ? "text-right" : ""}`}>
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className={`inline-flex items-center gap-1 hover:text-ink dark:hover:text-gray-100 ${sortKey === column.key ? "text-ink dark:text-gray-100" : ""}`}
                    >
                      {column.label}
                      {sortKey === column.key && <span>{sortDir === "asc" ? "▲" : "▼"}</span>}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line dark:divide-gray-800 dark:bg-gray-900">
              {sortedRows.map((row, index) => (
                <tr key={`${row.region.code}-${row.drug.id}-${index}`} className="text-ink-soft hover:bg-mist/60 dark:text-gray-300 dark:hover:bg-gray-800/60">
                  <td className="whitespace-nowrap px-4 py-2.5">
                    {row.region.sido} {row.region.sigungu}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5">{row.drug.displayName}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right font-bold text-ink tabular-nums dark:text-gray-100">
                    {formatPrice(row.avgPrice)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{formatPrice(row.minPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{formatPrice(row.maxPrice)}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{row.pharmacyCount}</td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-right tabular-nums">{row.reportCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
