import { formatPrice } from "@/lib/format";

export function PriceTag({ price }: { price: number }) {
  return <span>{formatPrice(price)}</span>;
}
