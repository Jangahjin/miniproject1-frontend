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
    <>
      <button type="button" onClick={requestLocation}>
        {label}
      </button>
      {showRegionPicker && <RegionPicker onSelect={selectRegion} />}
    </>
  );
}
