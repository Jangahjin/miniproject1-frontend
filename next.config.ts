import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // D:\claude에 이 프로젝트와 무관한 package-lock.json이 있어, Turbopack이
  // 프로젝트 루트를 그쪽으로 잘못 추론해 앱 소스를 못 찾고(Tailwind 유틸리티
  // 클래스가 전혀 생성되지 않는 등) 문제를 일으킨다. 루트를 명시해 고정한다.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
