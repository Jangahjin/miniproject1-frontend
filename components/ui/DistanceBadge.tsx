import { formatDistance } from "@/lib/format";

export function DistanceBadge({ meters }: { meters: number }) {
  return (
    <span className="inline-block rounded-sm border border-gray-300 px-1.5 py-0.5 font-serif text-xs font-medium tabular-nums text-gray-600 dark:border-gray-700 dark:text-gray-300">
      {formatDistance(meters)}
    </span>
  );
}
