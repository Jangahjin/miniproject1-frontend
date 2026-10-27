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
          background: "#13233F",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 900, letterSpacing: 6 }}>YAKFIT</div>
        <div style={{ display: "flex", fontSize: 32, color: "#C9D4E6" }}>
          약 이름으로 근처 최저가 약국을 찾아보세요
        </div>
      </div>
    ),
    { ...size },
  );
}
