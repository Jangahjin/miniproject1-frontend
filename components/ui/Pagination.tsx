"use client";

// 0부터 시작하는 page를 받아 "이전 · 1 … 4 5 6 … 18 · 다음" 형태로 그린다.
// 현재 페이지 앞뒤 2칸 + 처음·끝만 번호로 보여주고, 사이는 …로 줄여 버튼이 넘치지 않게 한다.
const WINDOW = 2;

function pageItems(page: number, totalPages: number): (number | "gap")[] {
  const items: (number | "gap")[] = [];
  const start = Math.max(1, page - WINDOW);
  const end = Math.min(totalPages - 2, page + WINDOW);
  items.push(0);
  if (start > 1) items.push("gap");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < totalPages - 2) items.push("gap");
  if (totalPages > 1) items.push(totalPages - 1);
  return items;
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const baseButton =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-control px-2.5 text-sm font-semibold tabular-nums transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center justify-center gap-1">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className={`${baseButton} text-ink-soft hover:bg-mist dark:text-gray-300 dark:hover:bg-gray-800`}
      >
        ← 이전
      </button>
      {pageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-sub">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`${baseButton} ${
              item === page
                ? "bg-brand text-white dark:bg-sky-400 dark:text-brand-deep"
                : "text-ink-soft hover:bg-mist dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {item + 1}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className={`${baseButton} text-ink-soft hover:bg-mist dark:text-gray-300 dark:hover:bg-gray-800`}
      >
        다음 →
      </button>
    </nav>
  );
}
