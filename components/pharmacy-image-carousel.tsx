"use client";

import { useEffect, useState } from "react";

// 실제 약국 사진은 DB에 없다(docs/DATABASE.md의 pharmacy 테이블에 이미지 컬럼이 없음).
// 사진이 붙기 전까지 보여줄 디자인 플레이스홀더 슬라이드다.
const SLIDES = [
  { emoji: "🏥", label: "약국 외관", gradient: "from-blue-400 to-blue-600" },
  { emoji: "💊", label: "조제실", gradient: "from-emerald-400 to-teal-600" },
  { emoji: "🧴", label: "진열대", gradient: "from-amber-400 to-orange-500" },
  { emoji: "🗺️", label: "찾아가는 길", gradient: "from-violet-400 to-purple-600" },
] as const;

const AUTOPLAY_MS = 4000;

export function PharmacyImageCarousel({ pharmacyName }: { pharmacyName: string }) {
  const [index, setIndex] = useState(0);

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
      <div
        className={`flex h-48 items-center justify-center bg-gradient-to-br ${slide.gradient} text-white transition-colors duration-500 md:h-64`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl" aria-hidden="true">
            {slide.emoji}
          </span>
          <span className="text-sm font-medium">
            {pharmacyName} · {slide.label}
          </span>
        </div>
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

      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.label}
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
