"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DrugAutocomplete } from "@/components/drug-autocomplete";
import type { DrugSummary } from "@/hooks/use-drug-autocomplete";
import { useUserLocation } from "@/hooks/use-user-location";
import { apiFetch } from "@/lib/api";

const POPULAR_DRUGS = ["타이레놀", "게보린", "판콜에이", "베아제", "펜잘", "판피린"];

export function DrugSearch() {
  const [query, setQuery] = useState("");
  const [locationError, setLocationError] = useState(false);
  const [popularLoading, setPopularLoading] = useState<string | null>(null);
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

  // 이전엔 칩을 눌러도 입력창에 글자만 채워져서, 자동완성 목록이 뜨면 사용자가
  // 항목을 한 번 더 클릭해야 검색이 시작됐다. "인기 검색어"는 원클릭으로 바로
  // 결과까지 가는 게 자연스러운 기대라, 이름과 정확히 일치하는 약을 직접 조회해
  // handleSelect까지 이어준다.
  async function handlePopularClick(name: string) {
    setPopularLoading(name);
    try {
      const data = await apiFetch<{ content: DrugSummary[] }>(
        `/api/v1/drugs?q=${encodeURIComponent(name)}&size=8`
      );
      const match = data.content.find((drug) => drug.displayName === name) ?? data.content[0];
      if (match) {
        await handleSelect(match);
      } else {
        setQuery(name);
      }
    } catch {
      // 조회 실패 시엔 최소한 입력창에 채워 넣어 사용자가 직접 이어갈 수 있게 한다.
      setQuery(name);
    } finally {
      setPopularLoading(null);
    }
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
              disabled={popularLoading !== null}
              onClick={() => handlePopularClick(name)}
              className="rounded-none border border-white/30 bg-white/10 px-3 py-1 text-sm text-white hover:border-sky-400 hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:opacity-60"
            >
              {popularLoading === name ? "찾는 중..." : name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
