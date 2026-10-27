import type { ReactNode } from "react";

// 관리자 각 페이지 상단의 제목 + 한 줄 설명. 페이지마다 제목 크기·여백이 달라지지 않게 한 곳에 둔다.
export function AdminPageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-1.5">
      <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink dark:text-gray-50">{title}</h1>
      {description && <p className="text-[15px] leading-relaxed text-sub dark:text-gray-400">{description}</p>}
      {children}
    </header>
  );
}
