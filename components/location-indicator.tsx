"use client";

import { useState } from "react";
import { useUserLocation } from "@/hooks/use-user-location";
import { RegionPicker } from "./region-picker";

// 예전엔 GPS가 거부/실패했을 때만 지역 선택 패널이 열려서, 이미 위치가 잡힌
// 사용자는 다른 지역으로 바꿀 방법이 없었다 — 이제 버튼을 누르면 상태와 무관하게
// "내 위치 사용" + 지역 목록 패널이 열린다.
export function LocationIndicator() {
  const { location, requestLocation, selectRegion } = useUserLocation();
  const [panelOpen, setPanelOpen] = useState(false);

  const label =
    location.status === "granted"
      ? "현재 위치"
      : location.status === "fallback"
        ? "선택한 지역"
        : location.status === "requesting"
          ? "위치 확인 중..."
          : "위치 설정 안 됨";

  async function handleUseGps() {
    setPanelOpen(false);
    await requestLocation();
  }

  function handleSelectRegion(regionCode: string, lat: number, lng: number) {
    setPanelOpen(false);
    selectRegion(regionCode, lat, lng);
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setPanelOpen((prev) => !prev)}
        aria-expanded={panelOpen}
        aria-label={label}
        // 헤더 오른쪽 버튼들(위치·로그인)은 모두 같은 높이(h-9)와 모서리(rounded-control)로 맞춘다.
        className="flex h-9 shrink-0 items-center gap-1.5 rounded-control border border-line bg-white px-3 text-[13px] font-semibold text-ink-soft transition hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 21c4.5-4.6 7-8.3 7-11.5a7 7 0 1 0-14 0C5 12.7 7.5 16.4 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
        {/* 모바일 헤더는 폭이 좁아(관리자 로그인 시 버튼 4개) 아이콘만 남기고, 이름은 aria-label로 전한다. */}
        <span className="hidden sm:inline">{label}</span>
      </button>
      {panelOpen && <RegionPicker onSelect={handleSelectRegion} onUseGps={handleUseGps} />}
    </div>
  );
}
