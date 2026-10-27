import { formatDistance } from "@/lib/format";

export function DistanceBadge({ meters }: { meters: number }) {
  return (
    <span className="inline-block rounded-full border border-line px-2 py-0.5 text-xs font-semibold tabular-nums text-sub dark:border-gray-700 dark:text-gray-300">
      {formatDistance(meters)}
    </span>
  );
}
