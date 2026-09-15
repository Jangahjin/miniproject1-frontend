"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// TODO(Task 010): 백엔드 T-14가 준비되면 API.md §7 실제 응답과 대조해 필드명을 검증한다.
interface RegionDistrict {
  code: string;
  name: string;
  centerLat: number;
  centerLng: number;
  pharmacyCount: number;
}

interface RegionGroup {
  sido: string;
  districts: RegionDistrict[];
}

export function RegionPicker({
  onSelect,
}: {
  onSelect: (regionCode: string, lat: number, lng: number) => void;
}) {
  const [groups, setGroups] = useState<RegionGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<RegionGroup[]>("/api/v1/regions")
      .then(setGroups)
      .catch(() => setError("지역 목록을 불러오지 못했습니다."));
  }, []);

  if (error) return <p role="alert">{error}</p>;

  return (
    <div role="dialog" aria-label="지역 선택">
      {groups.map((group) => (
        <div key={group.sido}>
          <p>{group.sido}</p>
          {group.districts.map((district) => (
            <button
              key={district.code}
              type="button"
              disabled={district.pharmacyCount === 0}
              onClick={() => onSelect(district.code, district.centerLat, district.centerLng)}
            >
              {district.name}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
