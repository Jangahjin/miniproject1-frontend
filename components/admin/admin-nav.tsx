"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// 관리자 화면 공통 메뉴. 예전엔 통계 3종이 한 페이지의 탭이라 주소로 바로 들어갈 수 없었고,
// 페이지 사이를 오가는 길이 "← 관리자 대시보드" 링크뿐이었다 — 메뉴를 항상 보이게 고정한다.
const GROUPS = [
  { title: "개요", items: [{ href: "/admin", label: "대시보드" }] },
  {
    title: "통계",
    items: [
      { href: "/admin/stats/regions", label: "지역별 통계" },
      { href: "/admin/stats/drugs", label: "약품별 분포" },
      { href: "/admin/stats/gaps", label: "가격 격차 Top 10" },
    ],
  },
  { title: "관리", items: [{ href: "/admin/reports", label: "이상치 제보" }] },
];

export function AdminNav() {
  const pathname = usePathname();
  // "/admin"은 모든 관리자 경로의 접두사라 정확히 같을 때만 활성으로 본다.
  const isActive = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));
  const mobileListRef = useRef<HTMLUListElement>(null);

  // 모바일 가로 메뉴에서 뒤쪽 메뉴(예: 이상치 제보)에 있으면 활성 칩이 화면 밖에 숨는다 —
  // 페이지가 바뀔 때마다 활성 칩이 보이도록 가로로만 스크롤해 준다.
  useEffect(() => {
    const list = mobileListRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active) return;
    // offsetLeft는 목록이 아니라 가장 가까운 positioned 조상 기준이라 틀린 값이 나온다 —
    // 화면 좌표 차이로 목록 안에서의 위치를 구한다.
    const offset = active.getBoundingClientRect().left - list.getBoundingClientRect().left;
    // smooth로 하면 페이지 진입 시 Next의 스크롤 처리와 겹쳐 취소되는 경우가 있어 즉시 이동한다.
    list.scrollLeft += offset - 16;
  }, [pathname]);

  return (
    <nav aria-label="관리자 메뉴">
      {/* 모바일: 가로로 스크롤되는 한 줄 메뉴 */}
      {/* 스와이프로 넘기는 메뉴라 스크롤바는 감춘다 (모바일 크롬에서 회색 막대·화살표가 보였다). */}
      <ul ref={mobileListRef} className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
        {GROUPS.flatMap((group) => group.items).map((item) => (
          <li key={item.href} className="shrink-0">
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`inline-flex rounded-full border px-3.5 py-1.5 text-[13px] font-semibold whitespace-nowrap transition ${
                isActive(item.href)
                  ? "border-brand bg-brand text-white dark:border-sky-400 dark:bg-sky-400 dark:text-brand-deep"
                  : "border-line bg-white text-ink-soft hover:border-brand hover:text-brand dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* 데스크톱: 그룹 제목이 있는 세로 사이드바 — 스크롤해도 따라온다. */}
      <div className="sticky top-[86px] hidden flex-col gap-6 lg:flex">
        <p className="text-xs font-bold tracking-[0.12em] text-sub dark:text-gray-500">ADMIN</p>
        {GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col gap-1">
            <p className="mb-1 px-3 text-xs font-bold text-sub dark:text-gray-500">{group.title}</p>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-control px-3 py-2 text-[15px] font-semibold transition ${
                  isActive(item.href)
                    ? "bg-brand-soft text-brand dark:bg-sky-400/10 dark:text-sky-300"
                    : "text-ink-soft hover:bg-mist hover:text-ink dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
