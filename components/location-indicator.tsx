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
        className="flex h-9 shrink-0 items-center rounded-full border border-gray-300 px-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:text-blue-400"
      >
        {label}
      </button>
      {panelOpen && <RegionPicker onSelect={handleSelectRegion} onUseGps={handleUseGps} />}
    </div>
  );
}
