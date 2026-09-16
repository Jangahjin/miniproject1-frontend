"use client";

import { useState } from "react";
import { PriceTag } from "@/components/ui/PriceTag";
import { formatRelativeDate } from "@/lib/format";
import { PriceHistoryChart } from "@/components/price-history-chart";

// docs/API.md §4 (T-19) 실제 응답 형태와 맞춰뒀다.
export interface DrugPrice {
  drugId: number;
  displayName: string;
  packageUnit: string;
  category: string;
  repPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  reportCount: number;
  lastReportedAt: string;
  nationalAvgPrice: number;
  diffFromNationalAvg: number;
}

// docs/DATABASE.md drug.category 컬럼과 동일한 7종 분류 + 순서다.
const CATEGORY_ORDER = ["해열진통", "소화제", "감기약", "연고", "소독약", "비타민", "기타"];
const CATEGORY_ICON: Record<string, string> = {
  해열진통: "💊",
  소화제: "🍽️",
  감기약: "🤧",
  연고: "🧴",
  소독약: "🧼",
  비타민: "🍊",
  기타: "📦",
};

function groupByCategory(drugPrices: DrugPrice[]): [string, DrugPrice[]][] {
  const groups = new Map<string, DrugPrice[]>();
  for (const drug of drugPrices) {
    const list = groups.get(drug.category) ?? [];
    list.push(drug);
    groups.set(drug.category, list);
  }
  const orderedKnown = CATEGORY_ORDER.filter((category) => groups.has(category));
  const unknown = [...groups.keys()].filter((category) => !CATEGORY_ORDER.includes(category));
  return [...orderedKnown, ...unknown].map((category) => [category, groups.get(category)!]);
}

// 등락률처럼 보이는 "+140원/-81원" 표기 대신 문장으로 풀어 쓴다.
function describeDiff(diff: number) {
  if (diff < 0) {
    return { text: `전국 평균보다 ${Math.abs(diff).toLocaleString("ko-KR")}원 저렴`, tone: "text-green-600" };
  }
  if (diff > 0) {
    return { text: `전국 평균보다 ${diff.toLocaleString("ko-KR")}원 비쌈`, tone: "text-gray-500" };
  }
  return { text: "전국 평균과 동일", tone: "text-gray-400" };
}

export function PharmacyDrugPrices({
  pharmacyId,
  drugPrices,
}: {
  pharmacyId: number;
  drugPrices: DrugPrice[];
}) {
  const [expandedDrugId, setExpandedDrugId] = useState<number | null>(null);
  const groups = groupByCategory(drugPrices);

  return (
    <div className="flex flex-col gap-5">
      {groups.map(([category, drugs]) => (
        <section key={category}>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <span aria-hidden="true">{CATEGORY_ICON[category] ?? "💊"}</span>
            {category}
            <span className="font-normal text-gray-400">{drugs.length}종</span>
          </h3>
          <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
            {drugs.map((drug) => {
              const diff = describeDiff(drug.diffFromNationalAvg);
              const expanded = expandedDrugId === drug.drugId;
              return (
                <li key={drug.drugId} className="px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => setExpandedDrugId(expanded ? null : drug.drugId)}
                    className="flex w-full items-start justify-between gap-4 text-left"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{drug.displayName}</p>
                      <p className="text-xs text-gray-500">{drug.packageUnit}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-base">
                        <PriceTag price={drug.repPrice} />
                      </p>
                      <p className={`text-xs ${diff.tone}`}>{diff.text}</p>
                    </div>
                  </button>
                  <p className="mt-1.5 text-xs text-gray-400">
                    제보 {drug.reportCount}건 · {formatRelativeDate(drug.lastReportedAt)} 갱신
                  </p>
                  {expanded && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <PriceHistoryChart pharmacyId={pharmacyId} drugId={drug.drugId} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
