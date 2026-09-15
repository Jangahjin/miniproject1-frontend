import { formatDistance } from "@/lib/format";

export function DistanceBadge({ meters }: { meters: number }) {
  return <span>{formatDistance(meters)}</span>;
}
