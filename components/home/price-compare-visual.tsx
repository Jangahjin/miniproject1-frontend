"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistance, formatPrice } from "@/lib/format";
import type { PriceRow } from "@/lib/home-snapshot";

// 같은 약의 약국별 가격 차이를 막대로 보여주는 그래픽. 홈 서버 컴포넌트가 실제 검색 결과에서
// 고른 행(rows)을 넘겨주고, 백엔드가 꺼져 있을 때만 caption에 "예시"임을 밝힌 대체 값을 쓴다.
// 뷰포트에 들어오면 막대가 위에서부터 차례로 늘어난다.
export function PriceCompareVisual({
  title,
  rows,
  caption,
}: {
  title: string;
  rows: PriceRow[];
  caption: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const maxPrice = Math.max(...rows.map((r) => r.price));
  const minPrice = Math.min(...rows.map((r) => r.price));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`w-[min(460px,88%)] transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
    >
      <p className="mb-2.5 text-xs font-bold tracking-[0.14em] text-brand-light">PRICE COMPARISON</p>
      <p className="mb-8 text-xl font-extrabold tracking-[-0.02em] text-white sm:text-[22px]">{title}</p>
      <ul className="flex flex-col gap-4">
        {rows.map((row, i) => {
          const isLowest = row.price === minPrice;
          return (
            <li key={`${row.pharmacyId}-${i}`} className="grid grid-cols-[78px_1fr_84px] items-center gap-3.5 sm:grid-cols-[96px_1fr_96px]">
              <span className="flex flex-col">
                <span className="truncate text-sm font-semibold text-[#C9D4E6]">{row.name}</span>
                <span className="text-[11px] text-brand-light tabular-nums">{formatDistance(row.distanceM)}</span>
              </span>
              <span className="h-2.5 overflow-hidden rounded-md bg-white/10">
                <i
                  className={`block h-full rounded-md transition-[width] duration-[1100ms] ease-[cubic-bezier(.2,.7,.2,1)] ${isLowest ? "bg-mint" : "bg-[#4A6697]"}`}
                  style={{ width: visible ? `${(row.price / maxPrice) * 100}%` : 0, transitionDelay: `${i * 120}ms` }}
                />
              </span>
              <span className="text-right text-[15px] font-extrabold text-white tabular-nums">
                {formatPrice(row.price)}
                {isLowest && <em className="mt-0.5 block text-[11px] font-extrabold not-italic text-mint">최저가</em>}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-8 border-t border-white/10 pt-5 text-[13px] leading-relaxed text-brand-light">{caption}</p>
    </div>
  );
}
