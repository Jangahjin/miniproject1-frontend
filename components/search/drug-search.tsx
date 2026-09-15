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
    <div>
      <DrugAutocomplete value={query} onChange={setQuery} onSelect={handleSelect} />

      <div>
        {POPULAR_DRUGS.map((name) => (
          <button key={name} type="button" onClick={() => setQuery(name)}>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
