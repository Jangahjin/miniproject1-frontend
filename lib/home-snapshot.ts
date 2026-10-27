import { apiFetch } from "@/lib/api";

// 홈 화면에 "실제 검색 결과"를 보여주기 위한 고정 조회 조건. DEMO.md에서 리허설로 검증한
// 조합(서울 동대문구 건강약국 좌표 · 타이레놀 500mg 8정 · 반경 2km)을 그대로 쓴다.
const SNAPSHOT_QUERY = {
  drugId: 1,
  lat: 37.579365,
  lng: 127.046646,
  radius: 2000,
  areaLabel: "서울 동대문구",
} as const;

const SOURCE_LABEL: Record<SearchResponse["dataSource"], string> = {
  SEED: "시드(목업) 데이터",
  MIXED: "시드 데이터 + 이용자 제보",
  USER: "이용자 제보",
};

// 가격은 제보가 쌓일 때만 바뀌므로 홈에서 매 요청마다 백엔드를 두드릴 필요가 없다 — 1시간 캐시.
const REVALIDATE_SECONDS = 3600;

interface SearchResponse {
  drug: { id: number; displayName: string; packageUnit: string };
  summary: {
    resultCount: number;
    candidateAvgPrice: number;
    candidateMinPrice: number;
    candidateMaxPrice: number;
    maxSaving: number;
  };
  dataSource: "SEED" | "MIXED" | "USER";
  results: {
    pharmacy: { id: number; name: string };
    price: { repPrice: number };
    distanceM: number;
  }[];
}

export interface PriceRow {
  pharmacyId: number;
  name: string;
  price: number;
  distanceM: number;
}

export interface HomeSnapshot {
  drugName: string;
  areaLabel: string;
  radiusLabel: string;
  // 화면에 그대로 싣는 출처 문구 — 시드(합성) 데이터를 실제 시세처럼 보이게 하지 않기 위해 항상 노출한다.
  sourceLabel: string;
  resultCount: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  maxSaving: number;
  // 가격 오름차순 전체
  rows: PriceRow[];
  drugCount: number | null;
  searchHref: string;
}

// 가격 오름차순 목록에서 최저·하위 25%·중간·상위 25%·최고를 골라, 막대 5개로 분포 전체를
// 보여준다. 앞에서 5개만 자르면 1,665~1,780원처럼 비슷한 값만 나와 "차이"가 안 보인다.
export function pickSpread(rows: PriceRow[], count = 5): PriceRow[] {
  if (rows.length <= count) return rows;
  const picked = new Set<number>();
  for (let i = 0; i < count; i++) {
    picked.add(Math.round((i * (rows.length - 1)) / (count - 1)));
  }
  return [...picked].map((i) => rows[i]);
}

// 백엔드가 꺼져 있어도 홈은 떠야 하므로 실패하면 null을 돌려주고, 화면은 기능 소개 위주로 대체한다.
export async function getHomeSnapshot(): Promise<HomeSnapshot | null> {
  const { drugId, lat, lng, radius, areaLabel } = SNAPSHOT_QUERY;
  const params = `drugId=${drugId}&lat=${lat}&lng=${lng}&radius=${radius}`;
  const cacheInit = { next: { revalidate: REVALIDATE_SECONDS } } as RequestInit;

  try {
    const [search, drugs] = await Promise.all([
      apiFetch<SearchResponse>(`/api/v1/search?${params}&sort=PRICE&limit=50`, cacheInit),
      apiFetch<{ totalElements: number }>("/api/v1/drugs?size=1", cacheInit).catch(() => null),
    ]);
    if (search.results.length < 2) return null;

    const rows = search.results
      .map((r) => ({ pharmacyId: r.pharmacy.id, name: r.pharmacy.name, price: r.price.repPrice, distanceM: r.distanceM }))
      .sort((a, b) => a.price - b.price);

    return {
      drugName: `${search.drug.displayName} ${search.drug.packageUnit}`,
      areaLabel,
      radiusLabel: `${radius / 1000}km`,
      sourceLabel: SOURCE_LABEL[search.dataSource] ?? "수집 데이터",
      resultCount: search.summary.resultCount,
      minPrice: search.summary.candidateMinPrice,
      maxPrice: search.summary.candidateMaxPrice,
      avgPrice: search.summary.candidateAvgPrice,
      maxSaving: search.summary.maxSaving,
      rows,
      drugCount: drugs?.totalElements ?? null,
      searchHref: `/search?${params}`,
    };
  } catch {
    return null;
  }
}
