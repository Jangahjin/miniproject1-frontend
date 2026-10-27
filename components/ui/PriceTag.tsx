import { formatPrice } from "@/lib/format";

// 예전엔 숫자만 세리프(Fraunces)로 바꿔 강조했지만, Pretendard로 통일한 뒤엔 한 줄 안에서
// 폰트가 섞여 보였다 — 같은 폰트의 굵기(extrabold)와 고정폭 숫자(tabular-nums)로 강조한다.
export function PriceTag({ price }: { price: number }) {
  return (
    <span className="font-extrabold tracking-[-0.01em] tabular-nums text-ink dark:text-gray-50">
      {formatPrice(price)}
    </span>
  );
}
