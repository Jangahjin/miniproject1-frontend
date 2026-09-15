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
    <div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="약국명을 검색하세요"
      />
      {isFetching && <span>검색 중...</span>}
      <ul>
        {results.map((pharmacy) => (
          <li key={pharmacy.id}>
            <button
              type="button"
              onClick={() => {
                onSelect(pharmacy);
                setQuery("");
              }}
            >
              {pharmacy.name} — {pharmacy.addressRoad}
            </button>
          </li>
        ))}
      </ul>
      {/* "지도에서 고르기"는 범위 밖 — 카카오맵 지도 클릭 좌표 -> 약국 역매핑 API가 없어 지금은 이름 검색만 지원 */}
    </div>
  );
}
