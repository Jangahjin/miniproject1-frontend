"use client";

import { useEffect, useRef, useState } from "react";

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
// 재방문자에게는 매번 뜨지 않도록, 한 번 본 뒤엔 이 키를 남겨 다시 보여주지 않는다.
const INTRO_SEEN_KEY = "yakfit-intro-seen";

export function SiteIntro() {
  // 기본값을 true가 아닌 false로 둬 서버 렌더 결과에는 인트로가 아예 없게 한다 —
  // localStorage는 서버에서 알 수 없으므로, "본 적 있는 재방문자"에게는 인트로
  // HTML이 잠깐이라도 그려졌다 사라지는 깜빡임이 아예 생기지 않는다.
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.localStorage.getItem(INTRO_SEEN_KEY)) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;

    window.localStorage.setItem(INTRO_SEEN_KEY, "1");
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    // 다이얼로그가 열리면 포커스를 안으로 옮겨야 키보드 사용자가 배경 콘텐츠를
    // 건드리지 않고 바로 "시작하기"/"건너뛰기"를 조작할 수 있다.
    startButtonRef.current?.focus();

    // aria-modal="true"만으로는 부족하다 — 실제로 접근성 트리를 찍어보면 배경의
    // 히어로·섹션들이 여전히 노출된다. dialog를 감싸는 조상(<main> 등)을 타고
    // 올라가며 형제 요소들에 inert를 걸어, 배경을 스크린리더/포커스 양쪽에서
    // 완전히 제외시킨다. 사이트마다 다이얼로그가 어느 깊이에 렌더되든 동작하도록
    // 특정 셀렉터에 의존하지 않고 DOM을 직접 순회한다.
    const inertedElements: HTMLElement[] = [];
    let node: HTMLElement | null = dialogRef.current;
    while (node && node.parentElement && node.parentElement !== document.body.parentElement) {
      const parent: HTMLElement = node.parentElement;
      for (const sibling of Array.from(parent.children)) {
        if (sibling !== node && sibling instanceof HTMLElement && !sibling.hasAttribute("inert")) {
          sibling.setAttribute("inert", "");
          inertedElements.push(sibling);
        }
      }
      node = parent;
    }

    const timer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setVisible(false);
        return;
      }
      if (event.key !== "Tab") return;
      // 포커스 트랩: 다이얼로그 안의 첫/마지막 포커스 가능 요소에서 Tab이
      // 배경 콘텐츠로 새 나가지 않도록 앞뒤를 감아 순환시킨다.
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])"
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      for (const el of inertedElements) el.removeAttribute("inert");
      previouslyFocused.current?.focus();
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="약핏 소개"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-blue-950 px-6 text-center text-white sm:gap-14"
    >
      <button
        type="button"
        onClick={() => setVisible(false)}
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

      {/* "아무 데나 클릭하면 닫힘"을 없앤 대신, 명확한 1차 동작을 버튼으로 준다.
          건너뛰기(보조)·시작하기(주 동작)·자동 소멸(무동작 시 안전망) 세 경로의
          역할이 겹치지 않도록 정리했다. */}
      <button
        ref={startButtonRef}
        type="button"
        onClick={() => setVisible(false)}
        className="mt-2 rounded-none border-2 border-white bg-white px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-blue-950 hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
      >
        시작하기
      </button>
    </div>
  );
}
