import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "@/lib/error-message";
import type { SearchResultItem } from "@/components/pharmacy-result-card";
import { SortToggle, RadiusFilter } from "@/components/sort-toggle";
import { SearchResults } from "@/components/search-results";
import { ErrorRetryLink } from "@/components/ui/ErrorRetryLink";

// docs/API.md §5 (T-15) 실제 응답 형태와 맞춰뒀다.
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
    return (
      <p role="alert" className="py-16 text-center text-sm text-red-600 dark:text-red-400">
        약품과 위치 정보가 필요합니다.
      </p>
    );
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
    return <ErrorRetryLink message={getErrorMessage(error, "검색 결과를 불러오지 못했습니다.")} />;
  }

  const currentSearchParams: Record<string, string | undefined> = {
    drugId,
    lat,
    lng,
    regionCode,
    radius: String(radius),
    sort,
  };

  const noResultsState = (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <p className="text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>
      {data.suggestion?.type === "EXPAND_RADIUS" ? (
        <Link
          href={buildExpandedRadiusHref(currentSearchParams, data.suggestion.recommendedRadius)}
          className="font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          반경을 {data.suggestion.recommendedRadius / 1000}km로 넓히면{" "}
          {data.suggestion.estimatedCount}곳이 있습니다
        </Link>
      ) : (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          최대 반경(5km)까지 넓혀도 등록된 약국이 없습니다. 다른 지역에서 검색해보세요.
        </p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b-2 border-gray-950 pb-4 dark:border-gray-50">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-blue-700/80 dark:text-blue-300/80">
          검색 결과
        </p>
        <h1 className="text-2xl font-black text-gray-950 dark:text-gray-50">{data.drug.displayName}</h1>
        {data.summary.resultCount > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            반경 {radius < 1000 ? `${radius}m` : `${radius / 1000}km`} 내{" "}
            <span className="font-serif font-semibold tabular-nums text-gray-950 dark:text-gray-50">{data.summary.resultCount}</span>곳
            {data.summary.maxSaving ? (
              <span className="text-blue-600 dark:text-blue-400">
                {" "}
                · 최대 <span className="font-serif tabular-nums">{data.summary.maxSaving}</span>원 절약 가능
              </span>
            ) : (
              ""
            )}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SortToggle current={sort as "SCORE" | "PRICE" | "DISTANCE"} searchParams={currentSearchParams} />
        <RadiusFilter current={radius} searchParams={currentSearchParams} />
      </div>
      {/* 결과가 0건이어도 지도는 항상 보여준다 — 예전엔 이 블록 전체가 안 그려져서
          "검색하면 지도가 안 보인다"는 문의의 원인이었다. */}
      <SearchResults
        results={data.results}
        userLocation={lat && lng ? { lat: Number(lat), lng: Number(lng) } : null}
        emptyState={noResultsState}
      />
    </div>
  );
}
