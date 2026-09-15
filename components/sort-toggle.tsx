import Link from "next/link";

type Sort = "SCORE" | "PRICE" | "DISTANCE";

const SORT_LABEL: Record<Sort, string> = {
  SCORE: "추천순",
  PRICE: "가격순",
  DISTANCE: "거리순",
};

const RADIUS_OPTIONS = [500, 1000, 2000, 5000] as const;

function buildHref(searchParams: Record<string, string | undefined>, overrides: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...searchParams, ...overrides })) {
    if (value !== undefined) params.set(key, value);
  }
  return `/search?${params.toString()}`;
}

export function SortToggle({
  current,
  searchParams,
}: {
  current: Sort;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <nav aria-label="정렬">
      {(Object.keys(SORT_LABEL) as Sort[]).map((sort) => (
        <Link
          key={sort}
          href={buildHref(searchParams, { sort })}
          aria-current={sort === current ? "true" : undefined}
        >
          {SORT_LABEL[sort]}
        </Link>
      ))}
    </nav>
  );
}

export function RadiusFilter({
  current,
  searchParams,
}: {
  current: number;
  searchParams: Record<string, string | undefined>;
}) {
  return (
    <nav aria-label="반경">
      {RADIUS_OPTIONS.map((radius) => (
        <Link
          key={radius}
          href={buildHref(searchParams, { radius: String(radius) })}
          aria-current={radius === current ? "true" : undefined}
        >
          {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
        </Link>
      ))}
    </nav>
  );
}
