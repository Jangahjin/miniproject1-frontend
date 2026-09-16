"use client";

import { Fragment, useState } from "react";
import { PriceTag } from "@/components/ui/PriceTag";
import { formatRelativeDate } from "@/lib/format";
import { PriceHistoryChart } from "@/components/price-history-chart";

// docs/API.md §4 (T-19) 실제 응답 형태와 맞춰뒀다.
export interface DrugPrice {
  drugId: number;
  displayName: string;
  packageUnit: string;
  repPrice: number;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  reportCount: number;
  lastReportedAt: string;
  nationalAvgPrice: number;
  diffFromNationalAvg: number;
}

export function PharmacyDrugPrices({
  pharmacyId,
  drugPrices,
}: {
  pharmacyId: number;
  drugPrices: DrugPrice[];
}) {
  const [expandedDrugId, setExpandedDrugId] = useState<number | null>(null);

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs text-gray-500">
            <th className="py-2 font-medium">약품</th>
            <th className="py-2 font-medium">대표가격</th>
            <th className="py-2 font-medium">제보 수</th>
            <th className="py-2 font-medium">최근 갱신</th>
            <th className="py-2 font-medium">전국 평균 대비</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {drugPrices.map((drug) => (
            <Fragment key={drug.drugId}>
              <tr className="hover:bg-gray-50">
                <td className="py-2 pr-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedDrugId((prev) => (prev === drug.drugId ? null : drug.drugId))
                    }
                    className="text-left font-medium text-gray-900 hover:text-blue-600"
                  >
                    {drug.displayName} ({drug.packageUnit})
                  </button>
                </td>
                <td className="py-2">
                  <PriceTag price={drug.repPrice} />
                </td>
                <td className="py-2 text-gray-600">{drug.reportCount}건</td>
                <td className="py-2 text-gray-600">{formatRelativeDate(drug.lastReportedAt)}</td>
                <td
                  className={`py-2 font-medium ${drug.diffFromNationalAvg < 0 ? "text-green-600" : "text-gray-500"}`}
                >
                  {drug.diffFromNationalAvg > 0 ? "+" : ""}
                  {drug.diffFromNationalAvg}원
                </td>
              </tr>
              {expandedDrugId === drug.drugId && (
                <tr>
                  <td colSpan={5} className="bg-gray-50 py-3">
                    <PriceHistoryChart pharmacyId={pharmacyId} drugId={drug.drugId} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
