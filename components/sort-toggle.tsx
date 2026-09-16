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
    <nav aria-label="정렬" className="flex gap-1 rounded-full bg-gray-100 p-1 text-sm">
      {(Object.keys(SORT_LABEL) as Sort[]).map((sort) => (
        <Link
          key={sort}
          href={buildHref(searchParams, { sort })}
          aria-current={sort === current ? "true" : undefined}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${
            sort === current ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
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
    <nav aria-label="반경" className="flex gap-1 text-sm">
      {RADIUS_OPTIONS.map((radius) => (
        <Link
          key={radius}
          href={buildHref(searchParams, { radius: String(radius) })}
          aria-current={radius === current ? "true" : undefined}
          className={`rounded-full border px-3 py-1 font-medium transition-colors ${
            radius === current
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
        </Link>
      ))}
    </nav>
  );
}
