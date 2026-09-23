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
  LOWEST_PRICE: "border-green-600 text-green-700 dark:border-green-400 dark:text-green-300",
  LOW_CONFIDENCE: "border-gray-400 text-gray-600 dark:border-gray-600 dark:text-gray-300",
  STALE_DATA: "border-amber-600 text-amber-700 dark:border-amber-400 dark:text-amber-300",
  NEAREST: "border-sky-600 text-sky-700 dark:border-sky-400 dark:text-sky-300",
};

export function PharmacyResultCard({
  item,
  isSelected,
  onMouseEnter,
  listRef,
}: {
  item: SearchResultItem;
  isSelected?: boolean;
  onMouseEnter?: () => void;
  listRef?: (el: HTMLLIElement | null) => void;
}) {
  return (
    <li
      aria-current={item.recommended ? "true" : undefined}
      onMouseEnter={onMouseEnter}
      ref={listRef}
      className={`flex flex-col gap-1.5 p-4 transition-all hover:-translate-y-0.5 hover:bg-gray-50 dark:hover:bg-gray-800 ${item.recommended ? "border-l-4 border-blue-950 bg-blue-50/40 dark:border-sky-400 dark:bg-blue-950/30" : ""} ${isSelected ? "!bg-sky-50 ring-2 ring-inset ring-sky-400 dark:!bg-sky-950/40" : ""}`}
    >
      <Link href={`/pharmacies/${item.pharmacy.id}`} className="font-semibold text-gray-900 hover:text-sky-600 dark:text-gray-100 dark:hover:text-sky-400">
        {item.pharmacy.name}
      </Link>
      <p className="text-sm text-gray-500 dark:text-gray-400">{item.pharmacy.addressRoad}</p>
      <p className="flex items-baseline gap-2 text-xl">
        <PriceTag price={item.price.repPrice} />
        <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
          · 최저 <PriceTag price={item.price.minPrice} />
        </span>
      </p>
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <DistanceBadge meters={item.distanceM} />
        <span>제보 {item.price.reportCount}건 · {formatRelativeDate(item.price.lastReportedAt)} 갱신</span>
      </p>
      {item.price.savingVsCandidateAvg > 0 && (
        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">평균보다 {item.price.savingVsCandidateAvg}원 저렴</p>
      )}
      {item.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {item.badges.map((badge) => (
            <span
              key={badge}
              className={`rounded-none border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${BADGE_STYLE[badge] ?? "border-gray-400 text-gray-600"}`}
            >
              {BADGE_LABEL[badge] ?? badge}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
