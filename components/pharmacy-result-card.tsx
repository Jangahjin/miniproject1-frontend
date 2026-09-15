import { PriceTag } from "@/components/ui/PriceTag";
import { DistanceBadge } from "@/components/ui/DistanceBadge";
import { formatRelativeDate } from "@/lib/format";

// TODO(Task 012): 백엔드 T-15가 준비되면 API.md §5 실제 응답과 대조해 필드명을 검증한다.
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

export function PharmacyResultCard({ item }: { item: SearchResultItem }) {
  return (
    <li aria-current={item.recommended ? "true" : undefined}>
      <p>{item.pharmacy.name}</p>
      <p>{item.pharmacy.addressRoad}</p>
      <p>
        <PriceTag price={item.price.repPrice} />
        {" · 최저 "}
        <PriceTag price={item.price.minPrice} />
      </p>
      <p>
        <DistanceBadge meters={item.distanceM} /> · 제보 {item.price.reportCount}건 ·{" "}
        {formatRelativeDate(item.price.lastReportedAt)} 갱신
      </p>
      {item.price.savingVsCandidateAvg > 0 && <p>평균보다 {item.price.savingVsCandidateAvg}원 저렴</p>}
      {item.badges.map((badge) => (
        <span key={badge}>{BADGE_LABEL[badge] ?? badge}</span>
      ))}
    </li>
  );
}
