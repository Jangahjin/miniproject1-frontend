import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 별도 심볼 없이 브랜드 남색 바탕에 "약" 한 글자만 둔 파비콘.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "#1F3C66",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 900,
        }}
      >
        약
      </div>
    ),
    { ...size },
  );
}
