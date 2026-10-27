// 약핏 심볼 마크 — 남색 둥근 사각형 위에 45° 기울인 캡슐. 캡슐의 반쪽을 "최저가" 의미 색인
// 민트로 칠해 "약 + 이득"을 한 형태에 담았다. 헤더 로고·인트로·파비콘(app/icon.tsx)이
// 같은 도형을 쓰도록 좌표를 여기 한 곳에만 둔다.
export const BRAND_MARK_COLORS = {
  tile: "#1F3C66",
  capsule: "#FFFFFF",
  accent: "#6FD3A4",
} as const;

// size는 next/og(ImageResponse)용 — 거기선 className이 무시되므로 width/height 속성이 필요하다.
export function BrandMark({ className = "h-8 w-8", tile = true, size }: { className?: string; tile?: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" className={className} width={size} height={size} aria-hidden="true">
      {tile && <rect width="64" height="64" rx="16" fill={BRAND_MARK_COLORS.tile} />}
      <g transform="rotate(-45 32 32)">
        <rect x="12" y="23" width="40" height="18" rx="9" fill={BRAND_MARK_COLORS.capsule} />
        <path d="M21 23h11v18H21a9 9 0 0 1 0-18Z" fill={BRAND_MARK_COLORS.accent} />
      </g>
    </svg>
  );
}
