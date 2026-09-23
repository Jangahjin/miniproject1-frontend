"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// IntersectionObserver로 뷰포트에 처음 들어올 때 한 번만 올라오며 나타나게 한다 —
// 스크롤할 때마다 다시 사라졌다 나타나면 눈이 피로해지므로 observer.disconnect()로
// 한 번 보이면 고정시킨다.
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
