import { formatDistance } from "@/lib/format";

export function DistanceBadge({ meters }: { meters: number }) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
      {formatDistance(meters)}
    </span>
  );
}
