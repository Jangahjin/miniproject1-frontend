import { formatPrice } from "@/lib/format";

// font-serif(Fraunces)는 라틴 문자에만 적용된다 — "원"은 시스템 한글 폰트로 남고
// 숫자만 대비되는 세리프로 바뀌어 가격이 시각적으로 두드러진다.
export function PriceTag({ price }: { price: number }) {
  return (
    <span className="font-serif font-semibold tabular-nums text-gray-950 dark:text-gray-50">
      {formatPrice(price)}
    </span>
  );
}
