import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Fraunces } from "next/font/google";
import { LocationIndicator } from "@/components/location-indicator";
import { AuthStatus } from "@/components/auth-status";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// 한글 본문은 시스템 폰트로 렌더링되므로(Fraunces엔 한글 글리프가 없음), 이 폰트는
// 숫자(가격·거리)와 로고의 영문 표기처럼 라틴 문자에만 적용해 포인트를 준다.
// axes는 실제로 쓰는 opsz(광학 크기)만 남겼다 — SOFT/WONK는 어디서도 안 써서
// 폰트 파일만 키우고 있었다.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "약핏 (YakFit)",
  description: "약국별 일반의약품 최저가 추천 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${geistSans.variable} ${fraunces.variable} h-full antialiased`}>
      {/* body가 h-full(고정 height:100%)이면, 검색 결과처럼 뷰포트보다 긴 페이지에서
          <main>이 flex-1 min-h-0 때문에 그 고정 높이에 맞춰 짜부라지고, 실제 콘텐츠는
          그 박스 밖으로 흘러넘친다 — 그 결과 바로 다음 형제인 이 아래 푸터 띠가 흘러넘친
          리스트 중간에 끼어든 것처럼 보였다. min-h-full(최소 높이)로 바꾸면 홈처럼 짧은
          페이지는 그대로 한 화면을 채우고, 긴 페이지는 body 자체가 콘텐츠만큼 늘어난다. */}
      <body className="flex min-h-full flex-col overflow-x-hidden bg-[var(--background)] text-[var(--foreground)]">
        <Providers>
          <header className="sticky top-0 z-10 border-b-2 border-gray-950 bg-white/90 backdrop-blur-sm dark:border-gray-50 dark:bg-black/90">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
              <Link href="/" className="flex items-baseline gap-0.5">
                <span className="text-xl font-black text-blue-950 dark:text-gray-50">약핏</span>
                <span className="text-xl font-black text-sky-500 dark:text-sky-400" aria-hidden="true">*</span>
                {/* 이전엔 Fraunces(장식적인 세리프 디스플레이 폰트)로 "YakFit"을 작게 넣었는데,
                    10px 크기에 넓은 자간까지 겹치니 Y의 세리프 획이 눌려 V처럼 보였다.
                    기본 산세리프(font-sans)로 바꾸면 대문자 Y가 뚜렷한 수직 기둥을 유지해
                    작은 크기에서도 헷갈리지 않는다. */}
                <span className="hidden ml-1.5 text-xs font-bold tracking-[0.15em] text-sky-600 sm:inline dark:text-sky-400">
                  YAKFIT
                </span>
              </Link>
              <div className="ml-auto flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                <LocationIndicator />
                <AuthStatus />
              </div>
            </div>
          </header>
          <main className="mx-auto flex w-full min-h-0 max-w-6xl flex-1 flex-col px-4 pt-8 pb-3">
            {children}
          </main>
          <div className="mx-[calc(50%-50vw)] w-screen border-t-2 border-gray-950 bg-blue-950 py-3 dark:border-gray-50 dark:bg-black">
            <p className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-400">
              © 약핏 YAKFIT
            </p>
          </div>
        </Providers>
      </body>
    </html>
  );
}
