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
  onUseGps,
}: {
  onSelect: (regionCode: string, lat: number, lng: number) => void;
  onUseGps?: () => void;
}) {
  const [groups, setGroups] = useState<RegionGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<RegionGroup[]>("/api/v1/regions")
      .then(setGroups)
      .catch(() => setError("지역 목록을 불러오지 못했습니다."));
  }, []);

  return (
    <div
      role="dialog"
      aria-label="위치 설정"
      className="absolute right-4 top-14 z-20 max-h-80 w-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      {onUseGps && (
        <button
          type="button"
          onClick={onUseGps}
          className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-1.5 text-left text-xs font-medium text-gray-700 hover:border-brand hover:text-brand dark:border-gray-700 dark:text-gray-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
        >
          📍 내 위치 사용
        </button>
      )}
      {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {groups.map((group) => (
        <div key={group.sido} className="mb-2">
          <p className="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">{group.sido}</p>
          <div className="flex flex-wrap gap-1">
            {group.sigungus.map((sigungu) => (
              <button
                key={sigungu.code}
                type="button"
                disabled={sigungu.pharmacyCount === 0}
                onClick={() => onSelect(sigungu.code, sigungu.centerLat, sigungu.centerLng)}
                className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-sky-400 dark:hover:text-sky-300"
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
