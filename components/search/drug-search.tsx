"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useUserLocation } from "@/hooks/use-user-location";

const POPULAR_DRUGS = ["타이레놀", "게보린", "판콜에이", "베아제", "펜잘", "판피린"];

export function DrugSearch() {
  const [query, setQuery] = useState("");
  const [locationError, setLocationError] = useState(false);
  const router = useRouter();
  const { location, requestLocation } = useUserLocation();

  async function handleSelect(drug: DrugSummary) {
    setLocationError(false);

    // GPS 응답은 비동기라 requestLocation() 직후 location을 읽으면 아직 이전 상태다.
    // 이미 좌표가 있으면 그대로 쓰고, 없으면 요청 결과(Promise)를 직접 받아서 쓴다.
    let coords = "lat" in location ? { lat: location.lat, lng: location.lng } : null;
    if (!coords) {
      coords = await requestLocation();
    }

    if (!coords) {
      setLocationError(true);
      return;
    }

    router.push(`/search?drugId=${drug.id}&lat=${coords.lat}&lng=${coords.lng}&radius=2000`);
  }

  return (
    <div className="flex flex-col gap-4">
      <DrugAutocomplete value={query} onChange={setQuery} onSelect={handleSelect} />

      {locationError && (
        <p role="alert" className="text-center text-xs text-red-400">
          위치 정보를 가져오지 못했습니다. 상단의 위치 설정에서 지역을 선택해주세요.
        </p>
      )}

      {/* 이 컴포넌트는 항상 남색/검정 히어로 배경 위에 놓이므로(라이트·다크 사이트
          테마와 무관), dark: 변형 대신 배경에 맞는 밝은 톤을 고정으로 쓴다. */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-sky-400/80">인기 검색어</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_DRUGS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setQuery(name)}
              className="rounded-none border border-white/30 bg-white/10 px-3 py-1 text-sm text-white hover:border-sky-400 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
