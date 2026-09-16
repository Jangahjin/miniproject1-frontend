import { formatPrice } from "@/lib/format";

export function PriceTag({ price }: { price: number }) {
  return <span className="font-semibold text-gray-900">{formatPrice(price)}</span>;
}
