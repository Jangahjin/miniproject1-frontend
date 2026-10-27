"use client";

import { useEffect, useRef } from "react";

// 화면 맨 위의 얇은 스크롤 진행 막대. 매 스크롤마다 setState로 리렌더하면 낭비라
// ref로 width만 직접 바꾼다.
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onScroll() {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) {
        barRef.current.style.width = `${docH > 0 ? (window.scrollY / docH) * 100 : 0}%`;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div ref={barRef} aria-hidden="true" className="fixed top-0 left-0 z-[60] h-[3px] w-0 bg-brand dark:bg-sky-400" />;
}
