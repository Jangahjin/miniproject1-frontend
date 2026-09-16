"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

// docs/API.md §7 (T-14) 실제 응답 형태와 맞춰뒀다.
interface Sigungu {
  code: string;
  sigungu: string;
  centerLat: number;
  centerLng: number;
  pharmacyCount: number;
}

interface RegionGroup {
  sido: string;
  sigungus: Sigungu[];
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

  if (error) return <p role="alert" className="text-xs text-red-600">{error}</p>;

  return (
    <div
      role="dialog"
      aria-label="지역 선택"
      className="absolute right-4 top-14 z-20 max-h-80 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg"
    >
      {groups.map((group) => (
        <div key={group.sido} className="mb-2">
          <p className="mb-1 text-xs font-semibold text-gray-500">{group.sido}</p>
          <div className="flex flex-wrap gap-1">
            {group.sigungus.map((sigungu) => (
              <button
                key={sigungu.code}
                type="button"
                disabled={sigungu.pharmacyCount === 0}
                onClick={() => onSelect(sigungu.code, sigungu.centerLat, sigungu.centerLng)}
                className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {sigungu.sigungu}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
