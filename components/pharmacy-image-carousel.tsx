"use client";

import { useEffect, useState } from "react";

// 실제 약국 사진은 DB에 없다(docs/DATABASE.md의 pharmacy 테이블에 이미지 컬럼이 없음).
// 사진이 붙기 전까지 보여줄 자리표시자라 이 약국의 실제 모습이 아니다 — Pexels 무료
// 스톡사진(출처 표시 불필요 라이선스)으로 채우고, "예시 이미지" 배지로 명확히 알린다.
const SLIDES = [
  {
    key: "exterior",
    label: "약국 외관",
    src: "https://images.pexels.com/photos/17003640/pexels-photo-17003640.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    key: "dispensary",
    label: "조제실",
    src: "https://images.pexels.com/photos/13119976/pexels-photo-13119976.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    key: "shelf",
    label: "진열대",
    src: "https://images.pexels.com/photos/6074000/pexels-photo-6074000.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
  {
    key: "directions",
    label: "찾아가는 길",
    src: "https://images.pexels.com/photos/8200445/pexels-photo-8200445.jpeg?auto=compress&cs=tinysrgb&w=1200",
  },
] as const;

const AUTOPLAY_MS = 4000;

export function PharmacyImageCarousel({ pharmacyName }: { pharmacyName: string }) {
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  function goTo(next: number) {
    setIndex((next + SLIDES.length) % SLIDES.length);
  }

  const slide = SLIDES[index];

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-sm">
      <div className="relative flex h-48 items-end bg-gray-200 text-white md:h-64 dark:bg-gray-800">
        {failed[slide.key] ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 dark:text-gray-500">
            이미지를 불러오지 못했습니다
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- 외부 스톡사진 hotlink, next/image 최적화 불필요
          <img
            src={slide.src}
            alt={`${pharmacyName} ${slide.label} 예시 이미지`}
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setFailed((prev) => ({ ...prev, [slide.key]: true }))}
          />
        )}
        <span className="relative z-10 w-full bg-gradient-to-t from-black/60 to-transparent px-4 py-3 text-sm font-medium">
          {pharmacyName} · {slide.label}
        </span>
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="이전 이미지"
        className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-lg text-white hover:bg-black/50"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="다음 이미지"
        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-lg text-white hover:bg-black/50"
      >
        ›
      </button>

      <div className="absolute bottom-14 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-16">
        {SLIDES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            aria-label={`${i + 1}번째 이미지로 이동`}
            aria-current={i === index}
            onClick={() => goTo(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-white" : "w-1.5 bg-white/50"
            }`}
          />
        ))}
      </div>

      <span className="absolute right-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white">
        예시 이미지
      </span>
    </div>
  );
}
