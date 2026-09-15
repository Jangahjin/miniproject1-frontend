"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useUserLocation } from "@/hooks/use-user-location";

// TODO(Task 011): 백엔드 T-13이 준비되면 API.md §3 실제 응답과 대조해 필드명을 검증한다.
interface DrugSummary {
  id: number;
  displayName: string;
  packageUnit: string;
}

interface DrugSearchResponse {
  content: DrugSummary[];
}

const POPULAR_DRUGS = ["타이레놀", "게보린", "판콜에이", "베아제", "펜잘", "판피린"];

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function DrugSearch() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const debouncedQuery = useDebouncedValue(query, 300);
  const listboxId = useId();
  const router = useRouter();
  const { location, requestLocation } = useUserLocation();

  const { data, isFetching } = useQuery({
    queryKey: ["drugs", "autocomplete", debouncedQuery],
    queryFn: () =>
      apiFetch<DrugSearchResponse>(`/api/v1/drugs?q=${encodeURIComponent(debouncedQuery)}&size=8`),
    enabled: debouncedQuery.length > 0,
  });

  const results = useMemo(() => data?.content ?? [], [data]);

  function goToSearch(drugId: number) {
    // 위치가 아직 없으면 요청부터 시작한다 — 좌표는 granted/fallback 상태가 됐을 때 /search에서 다시 읽는다.
    if (location.status === "idle") {
      requestLocation();
    }
    const lat = "lat" in location ? location.lat : "";
    const lng = "lng" in location ? location.lng : "";
    router.push(`/search?drugId=${drugId}&lat=${lat}&lng=${lng}&radius=2000`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && results[activeIndex]) {
        goToSearch(results[activeIndex].id);
      }
    } else if (event.key === "Escape") {
      setQuery("");
      setActiveIndex(-1);
    }
  }

  return (
    <div>
      <input
        role="combobox"
        aria-expanded={results.length > 0}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `drug-option-${activeIndex}` : undefined}
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder="약 이름을 검색하세요"
      />
      {isFetching && <span>검색 중...</span>}

      <ul id={listboxId} role="listbox">
        {results.map((drug, index) => (
          <li
            key={drug.id}
            id={`drug-option-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            onClick={() => goToSearch(drug.id)}
          >
            {drug.displayName} ({drug.packageUnit})
          </li>
        ))}
      </ul>

      <div>
        {POPULAR_DRUGS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setQuery(name);
              setActiveIndex(-1);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
