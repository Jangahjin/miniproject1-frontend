import { AdminNav } from "@/components/admin/admin-nav";

// 관리자 화면 공통 틀 — 데스크톱은 왼쪽 사이드바 + 본문, 모바일은 상단 가로 메뉴 + 본문.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="grid grid-cols-1 gap-6 pb-16 lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
      <AdminNav />
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}
