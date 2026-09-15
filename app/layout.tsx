import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">
        <Providers>
          <header>
            <span>약값알림</span>
            <LocationIndicator />
            <AuthStatus />
            <NoticeBanner />
          </header>
          <main className="flex flex-col flex-1">{children}</main>
          <footer>
            <NoticeBanner />
          </footer>
        </Providers>
      </body>
    </html>
  );
}
