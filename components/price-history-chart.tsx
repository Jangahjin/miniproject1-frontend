"use client";

import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { apiFetch } from "@/lib/api";

interface PricePoint {
  purchasedAt: string;
  price: number;
  flagged: boolean;
}

interface PriceHistoryResponse {
  pharmacyId: number;
  drugId: number;
  points: PricePoint[];
}

interface DotRenderProps {
  cx?: number;
  cy?: number;
  index?: number;
  payload?: PricePoint;
}

function FlagAwareDot(props: DotRenderProps) {
  const { cx, cy, index, payload } = props;
  if (cx === undefined || cy === undefined || !payload) return null;
  return (
    <circle
      key={index}
      cx={cx}
      cy={cy}
      r={4}
      fill={payload.flagged ? "#9ca3af" : "#2563eb"}
      stroke={payload.flagged ? "#6b7280" : "none"}
      strokeDasharray={payload.flagged ? "2 2" : undefined}
    />
  );
}

export function PriceHistoryChart({ pharmacyId, drugId }: { pharmacyId: number; drugId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["price-history", pharmacyId, drugId],
    queryFn: () =>
      apiFetch<PriceHistoryResponse>(`/api/v1/pharmacies/${pharmacyId}/drugs/${drugId}/history`),
  });

  if (isLoading) return <p>이력 불러오는 중...</p>;

  const points = data?.points ?? [];
  if (points.length === 0) return <p>가격 이력이 없습니다.</p>;

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={points}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="purchasedAt" />
        <YAxis />
        <Tooltip
          formatter={(value, _name, item) => {
            const price = typeof value === "number" ? value : Number(value);
            const flagged = (item?.payload as PricePoint | undefined)?.flagged;
            return [`${price.toLocaleString("ko-KR")}원${flagged ? " (통계에서 제외된 제보)" : ""}`];
          }}
        />
        <Line type="monotone" dataKey="price" stroke="#2563eb" dot={FlagAwareDot} />
      </LineChart>
    </ResponsiveContainer>
  );
}
