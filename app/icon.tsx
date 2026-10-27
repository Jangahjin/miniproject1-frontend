import { ImageResponse } from "next/og";
import { BrandMark } from "@/components/brand-mark";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 헤더 로고와 같은 캡슐 심볼을 파비콘으로 쓴다 — 탭에서도 같은 형태로 기억되게.
export default function Icon() {
  return new ImageResponse(<BrandMark size={32} />, { ...size });
}
