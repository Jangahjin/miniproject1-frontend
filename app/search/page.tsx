import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { PharmacyResultCard, type SearchResultItem } from "@/components/pharmacy-result-card";
import { SortToggle, RadiusFilter } from "@/components/sort-toggle";
import { NoticeBanner } from "@/components/ui/NoticeBanner";

// TODO(Task 012): 백엔드 T-15가 준비되면 API.md §5 실제 응답과 대조해 필드명을 검증한다.
interface SearchResponse {
  drug: { id: number; displayName: string; packageUnit: string; imageUrl: string };
  query: {
    lat: number;
    lng: number;
    radius: number;
    sort: string;
    locationSource: "GPS" | "REGION";
  };
  summary: {
    resultCount: number;
    candidateAvgPrice: number | null;
    candidateMinPrice: number | null;
    candidateMaxPrice: number | null;
    maxSaving: number | null;
  };
  dataSource: "SEED" | "MIXED" | "USER";
  results: SearchResultItem[];
  suggestion?: { type: "EXPAND_RADIUS"; recommendedRadius: number; estimatedCount: number };
}

const VALID_RADIUS = [500, 1000, 2000, 5000];
const VALID_SORT = ["SCORE", "PRICE", "DISTANCE"];

function buildExpandedRadiusHref(
  searchParams: Record<string, string | undefined>,
  radius: number
): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined) query.set(key, value);
  }
  query.set("radius", String(radius));
  return `/search?${query.toString()}`;
}

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  const drugId = typeof params.drugId === "string" ? params.drugId : undefined;
  const lat = typeof params.lat === "string" && params.lat !== "" ? params.lat : undefined;
  const lng = typeof params.lng === "string" && params.lng !== "" ? params.lng : undefined;
  const regionCode = typeof params.regionCode === "string" ? params.regionCode : undefined;
  const radius = VALID_RADIUS.includes(Number(params.radius)) ? Number(params.radius) : 2000;
  const sort = VALID_SORT.includes(String(params.sort)) ? String(params.sort) : "SCORE";

  if (!drugId || (!(lat && lng) && !regionCode)) {
    return <p role="alert">약품과 위치 정보가 필요합니다.</p>;
  }

  const query = new URLSearchParams({ drugId, radius: String(radius), sort });
  if (lat && lng) {
    query.set("lat", lat);
    query.set("lng", lng);
  } else if (regionCode) {
    query.set("regionCode", regionCode);
  }

  let data: SearchResponse;
  try {
    data = await apiFetch<SearchResponse>(`/api/v1/search?${query.toString()}`);
  } catch (error) {
    const message = error instanceof ApiError ? error.message : "검색 결과를 불러오지 못했습니다.";
    return <p role="alert">{message}</p>;
  }

  const currentSearchParams: Record<string, string | undefined> = {
    drugId,
    lat,
    lng,
    regionCode,
    radius: String(radius),
    sort,
  };

  return (
    <div>
      {(data.dataSource === "SEED" || data.dataSource === "MIXED") && <NoticeBanner />}
      <h1>{data.drug.displayName} 검색 결과</h1>

      {data.summary.resultCount > 0 ? (
        <div className="flex flex-col md:flex-row">
          <div className="flex-1">
            <p>
              반경 {radius < 1000 ? `${radius}m` : `${radius / 1000}km`} 내 {data.summary.resultCount}곳
              {data.summary.maxSaving ? ` · 최대 ${data.summary.maxSaving}원 절약 가능` : ""}
            </p>
            <SortToggle current={sort as "SCORE" | "PRICE" | "DISTANCE"} searchParams={currentSearchParams} />
            <RadiusFilter current={radius} searchParams={currentSearchParams} />
            <ul>
              {data.results.map((item) => (
                <PharmacyResultCard key={item.pharmacy.id} item={item} />
              ))}
            </ul>
          </div>
          {/* 지도는 Task 015(T-22)에서 채운다 */}
          <div className="hidden md:block md:w-1/2" aria-label="지도 영역 (준비 중)" />
        </div>
      ) : (
        <div>
          <p>검색 결과가 없습니다.</p>
          {data.suggestion?.type === "EXPAND_RADIUS" && (
            <Link href={buildExpandedRadiusHref(currentSearchParams, data.suggestion.recommendedRadius)}>
              반경을 {data.suggestion.recommendedRadius / 1000}km로 넓히면{" "}
              {data.suggestion.estimatedCount}곳이 있습니다
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
