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
    <nav aria-label="정렬" className="flex gap-4 border-b border-gray-200 text-sm dark:border-gray-800">
      {(Object.keys(SORT_LABEL) as Sort[]).map((sort) => (
        <Link
          key={sort}
          href={buildHref(searchParams, { sort })}
          aria-current={sort === current ? "true" : undefined}
          className={`border-b-2 pb-2 font-medium transition-colors ${
            sort === current
              ? "border-brand text-brand dark:border-sky-400 dark:text-sky-300"
              : "border-transparent text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
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
          className={`rounded-full border px-3.5 py-1.5 text-[13px] font-semibold tabular-nums transition-colors ${
            radius === current
              ? "border-brand bg-brand text-white dark:border-sky-400 dark:bg-sky-400 dark:text-brand-deep"
              : "border-line bg-white text-sub hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:border-sky-400 dark:hover:text-sky-300"
          }`}
        >
          {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
        </Link>
      ))}
    </nav>
  );
}
