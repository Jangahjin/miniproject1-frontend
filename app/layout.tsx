import type { Metadata } from "next";
import Link from "next/link";
import { Geist } from "next/font/google";
import { LocationIndicator } from "@/components/location-indicator";
import { AuthStatus } from "@/components/auth-status";
import { BrandMark } from "@/components/brand-mark";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "약핏 (YakFit)",
  description: "약국별 일반의약품 최저가 추천 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        {/* Pretendard 동적 서브셋 — 페이지에 실제로 쓰인 글자 묶음만 내려받아 한글 웹폰트치고 가볍다.
            next/font/local로 원본(약 2MB 가변 폰트)을 직접 넣는 것보다 초기 로딩이 훨씬 작다. */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      {/* body가 h-full(고정 height:100%)이면, 검색 결과처럼 뷰포트보다 긴 페이지에서
          <main>이 flex-1 min-h-0 때문에 그 고정 높이에 맞춰 짜부라지고, 실제 콘텐츠는
          그 박스 밖으로 흘러넘친다 — 그 결과 바로 다음 형제인 이 아래 푸터 띠가 흘러넘친
          리스트 중간에 끼어든 것처럼 보였다. min-h-full(최소 높이)로 바꾸면 홈처럼 짧은
          페이지는 그대로 한 화면을 채우고, 긴 페이지는 body 자체가 콘텐츠만큼 늘어난다. */}
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          {/* 예전의 굵은 검정 하단선(border-b-2) 대신 홈과 같은 얇은 line 색 테두리 + 반투명 블러. */}
          <header className="sticky top-0 z-10 border-b border-line bg-white/85 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/85">
            <div className="mx-auto flex h-[62px] max-w-6xl items-center gap-3 px-4">
              <Link href="/" className="flex items-center gap-2.5 rounded-control focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
                <BrandMark className="h-8 w-8" />
                <span className="text-[19px] font-extrabold tracking-[-0.03em] text-ink dark:text-gray-50">약핏</span>
                {/* 기본 산세리프로 둬야 작은 크기에서도 Y가 V처럼 뭉개지지 않는다. */}
                <span className="hidden text-[11px] font-bold tracking-[0.16em] text-sub sm:inline dark:text-gray-400">YAKFIT</span>
              </Link>
              <div className="ml-auto flex items-center gap-2 text-sm">
                <LocationIndicator />
                <AuthStatus />
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col px-4 pt-8 pb-3">
            {children}
          </main>
          {/* 홈 마지막 CTA(어두운 블록) 바로 아래에 어두운 푸터가 겹치면 두 겹의 띠처럼 보여서
              푸터는 밝은 mist 톤으로 둔다. 가격 서비스라 데이터 고지문을 함께 싣는다. */}
          <footer className="mx-[calc(50%-50vw)] w-screen border-t border-line bg-mist dark:border-gray-800 dark:bg-gray-950">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <BrandMark className="h-6 w-6" />
                  <span className="text-base font-extrabold tracking-[-0.03em] text-ink dark:text-gray-50">약핏</span>
                </div>
                <p className="max-w-md text-[13px] leading-[1.7] text-sub dark:text-gray-400">
                  표시되는 가격은 이용자 제보와 수집 데이터를 바탕으로 한 참고 정보이며, 실제 판매가와 다를 수 있습니다. 정확한
                  가격과 재고는 방문 전 약국에 확인해주세요.
                </p>
              </div>
              <nav aria-label="바로가기" className="flex gap-5 text-[13px] font-semibold text-ink-soft dark:text-gray-300">
                <Link href="/" className="hover:text-brand dark:hover:text-sky-300">
                  약값 검색
                </Link>
                <Link href="/reports/new" className="hover:text-brand dark:hover:text-sky-300">
                  가격 제보
                </Link>
                <Link href="/me" className="hover:text-brand dark:hover:text-sky-300">
                  내 정보
                </Link>
              </nav>
            </div>
            <p className="border-t border-line py-4 text-center text-xs text-sub dark:border-gray-800 dark:text-gray-500">© 2026 약핏 YakFit</p>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
