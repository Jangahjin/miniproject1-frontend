"use client";

import { useEffect, useState } from "react";

// 홈에 들어올 때마다 잠깐 떴다 사라지는 한 장짜리 소개 화면. 여러 장을 순서대로
// 넘기는 슬라이드쇼가 아니라, 모바일에서는 아이콘+설명이 가로로 쌓이고 데스크톱
// 에서는 3개가 가로로 나란히 배치되는 "레이아웃 자체가 바뀌는" 반응형이다.
const POINTS = [
  {
    label: "내 주변에서 바로",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 29c6-6.5 9-11.2 9-15.5A9 9 0 1 0 7 13.5C7 17.8 10 22.5 16 29Z" />
        <circle cx="16" cy="13" r="3.2" />
      </svg>
    ),
  },
  {
    label: "숫자로 보는 최저가",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 27h24M8 27V17M15 27V9M22 27V19" />
        <circle cx="15" cy="9" r="2.4" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "다 같이 만드는 시세",
    icon: (
      <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 8h22a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H14l-6 5v-5H5a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2Z" />
        <path d="M16 13v6M13 16h6" />
      </svg>
    ),
  },
];

const AUTO_DISMISS_MS = 2600;

export function SiteIntro() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = "";
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="약핏 소개"
      onClick={() => setVisible(false)}
      className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-10 bg-blue-950 px-6 text-center text-white sm:gap-14"
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
        }}
        className="absolute top-5 right-5 text-xs font-semibold tracking-widest text-sky-300 uppercase hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        건너뛰기
      </button>

      <div className="flex flex-col items-center gap-4">
        {/* 알약(캡슐) 실루엣 — 가운데 대각선으로 반을 갈라 흰색/하늘색 두 톤을 준
            전형적인 캡슐 아이콘이다. 추상적인 핀·차트 아이콘보다 "이건 약 사이트"라는
            게 한눈에 들어오도록 첫 화면의 주인공으로 크게 배치했다. */}
        <svg
          viewBox="0 0 64 64"
          className="intro-pill h-20 w-20 sm:h-24 sm:w-24"
          aria-hidden="true"
        >
          <g transform="rotate(-45 32 32)">
            <rect x="4" y="20" width="56" height="24" rx="12" fill="#ffffff" />
            <rect x="4" y="20" width="28" height="24" fill="#38bdf8" clipPath="url(#intro-pill-clip)" />
            <rect x="4" y="20" width="56" height="24" rx="12" fill="none" stroke="#e0f2fe" strokeWidth="1.5" />
          </g>
          <clipPath id="intro-pill-clip">
            <rect x="4" y="20" width="28" height="24" rx="0" />
          </clipPath>
        </svg>
        <div className="flex flex-col items-center gap-2">
          <p className="text-3xl font-black sm:text-5xl">
            약핏<span className="text-sky-400">*</span>
          </p>
          <p className="text-sm text-sky-100/80 sm:text-base">약 이름으로 근처 최저가 약국을 찾아보세요</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-10">
        {POINTS.map((point) => (
          <div key={point.label} className="flex items-center gap-3 sm:flex-col sm:gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-sky-400 text-blue-950">
              {point.icon}
            </div>
            <span className="text-sm font-medium text-white sm:text-xs sm:uppercase sm:tracking-wide">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
