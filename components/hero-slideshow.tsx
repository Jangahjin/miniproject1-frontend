"use client";

import { useEffect, useState } from "react";

// 약국 상세 페이지 캐러셀(pharmacy-image-carousel.tsx)에서 이미 국적·브랜드 특징이
// 없는지 검증해둔 Pexels 사진을 재사용한다 — 히어로 배경은 특정 약국을 가리키는 게
// 아니라 분위기용 배경이라 "예시 이미지" 배지 없이 쓴다.
const SLIDES = [
  "https://images.pexels.com/photos/17003640/pexels-photo-17003640.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/13119976/pexels-photo-13119976.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "https://images.pexels.com/photos/6074000/pexels-photo-6074000.jpeg?auto=compress&cs=tinysrgb&w=1600",
] as const;

const AUTOPLAY_MS = 5000;

export function HeroSlideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {SLIDES.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- 외부 스톡사진 hotlink, next/image 최적화 불필요
        <img
          key={src}
          src={src}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {/* 사진 위에 남색 톤을 짙게 깔아서 흰 글자 가독성과 사이트의 네이비 정체성을 유지한다. */}
      <div className="absolute inset-0 bg-blue-950/80 dark:bg-black/85" />
    </div>
  );
}
