"use client";

import { useRef, useState } from "react";
import { PharmacyResultCard, type SearchResultItem } from "@/components/pharmacy-result-card";
import { PharmacyMap } from "@/components/pharmacy-map";

export function SearchResults({
  results,
  userLocation,
}: {
  results: SearchResultItem[];
  userLocation: { lat: number; lng: number } | null;
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
      <ul className="flex-1 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {results.map((item) => (
          <PharmacyResultCard
            key={item.pharmacy.id}
            item={item}
            onMouseEnter={() => setSelectedId(item.pharmacy.id)}
            listRef={(el) => {
              if (el) itemRefs.current.set(item.pharmacy.id, el);
              else itemRefs.current.delete(item.pharmacy.id);
            }}
          />
        ))}
      </ul>
      <div className="hidden h-72 overflow-hidden rounded-xl border border-gray-200 md:block md:w-1/2">
        <PharmacyMap
          markers={markers}
          userLocation={userLocation}
          selectedId={selectedId}
          onSelectMarker={handleSelectFromMap}
        />
      </div>
    </div>
  );
}
