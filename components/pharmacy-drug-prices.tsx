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
    <table>
      <thead>
        <tr>
          <th>약품</th>
          <th>대표가격</th>
          <th>제보 수</th>
          <th>최근 갱신</th>
          <th>전국 평균 대비</th>
        </tr>
      </thead>
      <tbody>
        {drugPrices.map((drug) => (
          <Fragment key={drug.drugId}>
            <tr>
              <td>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedDrugId((prev) => (prev === drug.drugId ? null : drug.drugId))
                  }
                >
                  {drug.displayName} ({drug.packageUnit})
                </button>
              </td>
              <td>
                <PriceTag price={drug.repPrice} />
              </td>
              <td>{drug.reportCount}건</td>
              <td>{formatRelativeDate(drug.lastReportedAt)}</td>
              <td style={{ color: drug.diffFromNationalAvg < 0 ? "green" : "gray" }}>
                {drug.diffFromNationalAvg > 0 ? "+" : ""}
                {drug.diffFromNationalAvg}원
              </td>
            </tr>
            {expandedDrugId === drug.drugId && (
              <tr>
                <td colSpan={5}>
                  <PriceHistoryChart pharmacyId={pharmacyId} drugId={drug.drugId} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  );
}
