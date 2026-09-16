"use client";

import { useUserLocation } from "@/hooks/use-user-location";
import { RegionPicker } from "./region-picker";

export function LocationIndicator() {
  const { location, requestLocation, selectRegion } = useUserLocation();

  const label =
    location.status === "granted"
      ? "현재 위치"
      : location.status === "fallback"
        ? "선택한 지역"
        : location.status === "requesting"
          ? "위치 확인 중..."
          : "위치 설정 안 됨";

  const showRegionPicker = location.status === "denied" || location.status === "unavailable";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={requestLocation}
        className="rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600"
      >
        {label}
      </button>
      {showRegionPicker && <RegionPicker onSelect={selectRegion} />}
    </div>
  );
}
