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
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← 관리자 대시보드
        </Link>
        <h1 className="mt-1 text-xl font-bold text-gray-900">관리자 통계</h1>
      </div>

      <nav className="-mx-4 flex gap-5 overflow-x-auto border-b border-gray-200 px-4 text-sm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 whitespace-nowrap pb-2 ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 font-semibold text-blue-600"
                : "text-gray-400 hover:text-gray-600"
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
