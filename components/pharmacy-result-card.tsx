import Link from "next/link";
import { PriceTag } from "@/components/ui/PriceTag";
import { DistanceBadge } from "@/components/ui/DistanceBadge";
import { formatRelativeDate } from "@/lib/format";

// docs/API.md §5 (T-15) 실제 응답 형태와 맞춰뒀다.
export interface SearchResultItem {
  rank: number;
  recommended: boolean;
  pharmacy: {
    id: number;
    name: string;
    addressRoad: string;
    lat: number;
    lng: number;
    phone: string;
  };
  price: {
    repPrice: number;
    minPrice: number;
    avgPrice: number;
    savingVsCandidateAvg: number;
    reportCount: number;
    lastReportedAt: string;
    daysSinceLastReport: number;
  };
  distanceM: number;
  score: number;
  badges: ("LOWEST_PRICE" | "LOW_CONFIDENCE" | "STALE_DATA" | "NEAREST")[];
}

const BADGE_LABEL: Record<string, string> = {
  LOWEST_PRICE: "최저가 추천",
  LOW_CONFIDENCE: "정보 부족",
  STALE_DATA: "오래된 정보",
  NEAREST: "최단거리",
};

const BADGE_STYLE: Record<string, string> = {
  LOWEST_PRICE: "bg-green-100 text-green-700",
  LOW_CONFIDENCE: "bg-gray-100 text-gray-600",
  STALE_DATA: "bg-amber-100 text-amber-700",
  NEAREST: "bg-blue-100 text-blue-700",
};

export function PharmacyResultCard({
  item,
  onMouseEnter,
  listRef,
}: {
  item: SearchResultItem;
  onMouseEnter?: () => void;
  listRef?: (el: HTMLLIElement | null) => void;
}) {
  return (
    <li
      aria-current={item.recommended ? "true" : undefined}
      onMouseEnter={onMouseEnter}
      ref={listRef}
      className={`flex flex-col gap-1.5 p-4 hover:bg-gray-50 ${item.recommended ? "bg-blue-50/60" : ""}`}
    >
      <Link href={`/pharmacies/${item.pharmacy.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
        {item.pharmacy.name}
      </Link>
      <p className="text-sm text-gray-500">{item.pharmacy.addressRoad}</p>
      <p className="flex items-baseline gap-2 text-lg">
        <PriceTag price={item.price.repPrice} />
        <span className="text-xs font-normal text-gray-400">
          · 최저 <PriceTag price={item.price.minPrice} />
        </span>
      </p>
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
        <DistanceBadge meters={item.distanceM} />
        <span>제보 {item.price.reportCount}건 · {formatRelativeDate(item.price.lastReportedAt)} 갱신</span>
      </p>
      {item.price.savingVsCandidateAvg > 0 && (
        <p className="text-xs font-medium text-blue-600">평균보다 {item.price.savingVsCandidateAvg}원 저렴</p>
      )}
      {item.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {item.badges.map((badge) => (
            <span
              key={badge}
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${BADGE_STYLE[badge] ?? "bg-gray-100 text-gray-600"}`}
            >
              {BADGE_LABEL[badge] ?? badge}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
