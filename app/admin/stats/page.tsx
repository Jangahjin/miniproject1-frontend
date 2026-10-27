"use client";

import { useState } from "react";
import Link from "next/link";
import { RegionStatsPanel } from "@/components/charts/region-stats-panel";
import { DrugDistributionPanel } from "@/components/charts/drug-distribution-panel";
import { PriceGapPanel } from "@/components/charts/price-gap-panel";

type Tab = "regions" | "drugs" | "gaps";

const TABS: { key: Tab; label: string }[] = [
  { key: "regions", label: "지역별 통계" },
  { key: "drugs", label: "약품별 분포" },
  { key: "gaps", label: "가격 격차 Top 10" },
];

export default function AdminStatsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("regions");

  // 403 리다이렉트는 각 탭 패널이 자신의 useQuery로 직접 처리한다 (useAdminGuard).
  // 페이지 레벨에 별도 가드 쿼리를 두면 탭 쿼리와 동시에 인증 요청이 나가면서
  // refresh token이 단발성(rotate)일 때 경쟁 상태로 401이 발생했다.

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div>
        <Link href="/admin" className="text-sm text-sub hover:text-brand dark:text-gray-400 dark:hover:text-sky-300">
          ← 관리자 대시보드
        </Link>
        <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">관리자 통계</h1>
      </div>

      {/* 구분선을 border 대신 inset 그림자로 그려야, 활성 탭 밑줄이 그 위에 겹쳐도 세로로 넘치지 않는다
          (overflow-x-auto 컨테이너는 세로 넘침도 스크롤로 만들어 ▲▼ 화살표가 생겼다). */}
      <nav className="flex gap-6 overflow-x-auto text-[15px] shadow-[inset_0_-1px_0_var(--color-line)] dark:shadow-[inset_0_-1px_0_#1f2937]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 whitespace-nowrap border-b-2 pb-2.5 ${
              activeTab === tab.key
                ? "border-brand font-bold text-brand dark:border-sky-400 dark:text-sky-400"
                : "border-transparent font-semibold text-sub hover:text-ink dark:text-gray-500 dark:hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "regions" && <RegionStatsPanel />}
      {activeTab === "drugs" && <DrugDistributionPanel />}
      {activeTab === "gaps" && <PriceGapPanel />}
    </div>
  );
}
