"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

// TODO: 백엔드 T-19가 준비되면 API.md §4 실제 응답과 대조해 필드명을 검증한다.
export interface PharmacySummary {
  id: number;
  name: string;
  addressRoad: string;
}

interface PharmacySearchResponse {
  content: PharmacySummary[];
}

export function PharmacyPicker({
  onSelect,
}: {
  onSelect: (pharmacy: PharmacySummary) => void;
}) {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const { data, isFetching } = useQuery({
    queryKey: ["pharmacies", "autocomplete", debouncedQuery],
    queryFn: () =>
      apiFetch<PharmacySearchResponse>(
        `/api/v1/pharmacies?q=${encodeURIComponent(debouncedQuery)}&size=8`
      ),
    enabled: debouncedQuery.length > 0,
  });

  const results = data?.content ?? [];

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="약국명을 검색하세요"
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
      {isFetching && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          검색 중...
        </span>
      )}
      {results.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-lg">
          {results.map((pharmacy) => (
            <li key={pharmacy.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(pharmacy);
                  setQuery("");
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50"
              >
                <span className="font-medium text-gray-900">{pharmacy.name}</span>{" "}
                <span className="text-gray-500">{pharmacy.addressRoad}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {/* "지도에서 고르기"는 범위 밖 — 카카오맵 지도 클릭 좌표 -> 약국 역매핑 API가 없어 지금은 이름 검색만 지원 */}
    </div>
  );
}
