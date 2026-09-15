"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// TODO: 백엔드 T-13이 준비되면 API.md §3 실제 응답과 대조해 필드명을 검증한다.
export interface DrugSummary {
  id: number;
  displayName: string;
  packageUnit: string;
}

interface DrugSearchResponse {
  content: DrugSummary[];
}

export function useDrugAutocomplete(query: string) {
  return useQuery({
    queryKey: ["drugs", "autocomplete", query],
    queryFn: () =>
      apiFetch<DrugSearchResponse>(`/api/v1/drugs?q=${encodeURIComponent(query)}&size=8`),
    enabled: query.length > 0,
  });
}
