import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NoticeBanner } from "@/components/ui/NoticeBanner";
import { LocationIndicator } from "@/components/location-indicator";
import { AuthStatus } from "@/components/auth-status";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "약값알림",
  description: "약국별 일반의약품 최저가 추천 서비스",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Providers>
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
              <Link href="/" className="text-lg font-bold text-blue-600 hover:text-blue-700">
                약값알림
              </Link>
              <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
                <LocationIndicator />
                <AuthStatus />
              </div>
            </div>
            <NoticeBanner />
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white">
            <NoticeBanner />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
