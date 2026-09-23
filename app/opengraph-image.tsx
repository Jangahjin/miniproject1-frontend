import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "#172554",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 96, fontWeight: 900 }}>
          약핏
          <span style={{ color: "#38bdf8", marginLeft: 4 }}>*</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#7dd3fc" }}>
          약 이름으로 근처 최저가 약국을 찾아보세요
        </div>
      </div>
    ),
    { ...size },
  );
}
