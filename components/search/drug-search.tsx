"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useUserLocation } from "@/hooks/use-user-location";

const POPULAR_DRUGS = ["타이레놀", "게보린", "판콜에이", "베아제", "펜잘", "판피린"];

export function DrugSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { location, requestLocation } = useUserLocation();

  function handleSelect(drug: DrugSummary) {
    // 위치가 아직 없으면 요청부터 시작한다 — 좌표는 granted/fallback 상태가 됐을 때 /search에서 다시 읽는다.
    if (location.status === "idle") {
      requestLocation();
    }
    const lat = "lat" in location ? location.lat : "";
    const lng = "lng" in location ? location.lng : "";
    router.push(`/search?drugId=${drug.id}&lat=${lat}&lng=${lng}&radius=2000`);
  }

  return (
    <div className="flex flex-col gap-4">
      <DrugAutocomplete value={query} onChange={setQuery} onSelect={handleSelect} />

      <div className="flex flex-wrap justify-center gap-2">
        {POPULAR_DRUGS.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setQuery(name)}
            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600"
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
