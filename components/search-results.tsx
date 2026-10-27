"use client";

import { useRef, useState } from "react";
import { PharmacyResultCard, type SearchResultItem } from "@/components/pharmacy-result-card";
import { PharmacyMap } from "@/components/pharmacy-map";

export function SearchResults({
  results,
  userLocation,
  emptyState,
}: {
  results: SearchResultItem[];
  userLocation: { lat: number; lng: number } | null;
  emptyState?: React.ReactNode;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

  function handleSelectFromMap(pharmacyId: number) {
    setSelectedId(pharmacyId);
    itemRefs.current.get(pharmacyId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const markers = results.map((item) => ({
    pharmacyId: item.pharmacy.id,
    lat: item.pharmacy.lat,
    lng: item.pharmacy.lng,
    price: item.price.repPrice,
    rank: item.rank,
  }));

  return (
    <div className="flex flex-col gap-4 md:flex-row md:gap-6">
      {/* 지도를 리스트보다 먼저 둬서, 결과가 없어도(또는 모바일에서 리스트가 길어도)
          사용자 위치가 바로 눈에 들어오게 한다 — 예전엔 md:block으로 모바일에서 지도 자체가
          숨겨져 있었고, 결과 0건일 때는 이 섹션 자체가 렌더링되지 않았다. */}
      <div className="h-72 overflow-hidden rounded-card border border-line dark:border-gray-800 md:sticky md:top-24 md:order-2 md:h-[calc(100vh-8rem)] md:w-1/2">
        <PharmacyMap
          markers={markers}
          userLocation={userLocation}
          selectedId={selectedId}
          onSelectMarker={handleSelectFromMap}
        />
      </div>
      <ul className="flex-1 divide-y divide-gray-200 overflow-hidden border-t border-line dark:divide-gray-800 dark:border-gray-800">
        {results.length > 0
          ? results.map((item) => (
              <PharmacyResultCard
                key={item.pharmacy.id}
                item={item}
                isSelected={selectedId === item.pharmacy.id}
                onMouseEnter={() => setSelectedId(item.pharmacy.id)}
                listRef={(el) => {
                  if (el) itemRefs.current.set(item.pharmacy.id, el);
                  else itemRefs.current.delete(item.pharmacy.id);
                }}
              />
            ))
          : emptyState && <li className="p-4">{emptyState}</li>}
      </ul>
    </div>
  );
}
