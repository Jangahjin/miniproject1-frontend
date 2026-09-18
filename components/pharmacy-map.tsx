"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

// 카카오맵 JS SDK는 별도 타입 패키지를 쓰지 않고, 이 파일에서 쓰는 표면만 최소로 선언한다.
// TODO(Task 015): 커뮤니티 타입(@types/kakao.maps.d.ts 등) 도입을 검토할 수 있음.
interface KakaoLatLng {
  getLat(): number;
  getLng(): number;
}

interface KakaoMap {
  setBounds(bounds: KakaoLatLngBounds): void;
  panTo(position: KakaoLatLng): void;
}

interface KakaoMarker {
  getPosition(): KakaoLatLng;
}

interface KakaoLatLngBounds {
  extend(position: KakaoLatLng): void;
  isEmpty(): boolean;
}

interface KakaoCustomOverlay {
  setMap(map: KakaoMap | null): void;
  setContent(content: string): void;
}

interface KakaoMapsNamespace {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  Marker: new (options: { position: KakaoLatLng; map: KakaoMap }) => KakaoMarker;
  CustomOverlay: new (options: {
    position: KakaoLatLng;
    yAnchor: number;
    content: string;
  }) => KakaoCustomOverlay;
  LatLngBounds: new () => KakaoLatLngBounds;
  event: { addListener: (target: KakaoMarker, type: string, handler: () => void) => void };
  load: (callback: () => void) => void;
}

declare global {
  interface Window {
    kakao?: { maps: KakaoMapsNamespace };
  }
}

export interface MapMarkerData {
  pharmacyId: number;
  lat: number;
  lng: number;
  price: number;
  rank: number;
}

// 선택된 마커는 노란 테두리 + 확대로 강조한다. 1위 색상(rank===1)과는 별개 축이라
// "1위이면서 선택됨"도 동시에 표현된다.
function buildOverlayHtml(item: MapMarkerData, isSelected: boolean): string {
  const background = item.rank === 1 ? "#2563eb" : "#111827";
  const highlight = isSelected
    ? "box-shadow:0 0 0 3px #facc15;transform:scale(1.2);z-index:10;position:relative;"
    : "";
  return `<div style="background:${background};color:#fff;padding:2px 6px;border-radius:4px;font-size:12px;white-space:nowrap;transition:transform .15s ease;${highlight}">${item.price.toLocaleString("ko-KR")}원</div>`;
}

export function PharmacyMap({
  markers,
  userLocation,
  selectedId,
  onSelectMarker,
}: {
  markers: MapMarkerData[];
  userLocation: { lat: number; lng: number } | null;
  selectedId: number | null;
  onSelectMarker: (pharmacyId: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMap | null>(null);
  const markerRefs = useRef<Map<number, KakaoMarker>>(new Map());
  const overlayRefs = useRef<Map<number, KakaoCustomOverlay>>(new Map());
  const markersByIdRef = useRef<Map<number, MapMarkerData>>(new Map());
  const previousSelectedRef = useRef<number | null>(null);
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY);
  const [sdkFailed, setSdkFailed] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const initMap = useCallback(() => {
    const maps = window.kakao?.maps;
    const container = containerRef.current;
    if (!container || !maps) return;

    maps.load(() => {
      const center = markers[0]
        ? new maps.LatLng(markers[0].lat, markers[0].lng)
        : new maps.LatLng(37.5665, 126.978);

      const map = new maps.Map(container, { center, level: 5 });
      mapRef.current = map;

      const bounds = new maps.LatLngBounds();

      markerRefs.current.clear();
      overlayRefs.current.clear();
      markersByIdRef.current.clear();
      previousSelectedRef.current = null;

      if (userLocation) {
        const userPosition = new maps.LatLng(userLocation.lat, userLocation.lng);
        new maps.Marker({ position: userPosition, map });
        bounds.extend(userPosition);
      }

      markers.forEach((item) => {
        const position = new maps.LatLng(item.lat, item.lng);
        const marker = new maps.Marker({ position, map });

        const overlay = new maps.CustomOverlay({
          position,
          yAnchor: 2.2,
          content: buildOverlayHtml(item, false),
        });
        overlay.setMap(map);

        maps.event.addListener(marker, "click", () => onSelectMarker(item.pharmacyId));

        markerRefs.current.set(item.pharmacyId, marker);
        overlayRefs.current.set(item.pharmacyId, overlay);
        markersByIdRef.current.set(item.pharmacyId, item);
        bounds.extend(position);
      });

      if (!bounds.isEmpty()) map.setBounds(bounds);
      setSdkReady(true);
    });
  }, [markers, userLocation, onSelectMarker]);

  useEffect(() => {
    if (!sdkReady) return;

    const prevId = previousSelectedRef.current;
    if (prevId !== null && prevId !== selectedId) {
      const prevItem = markersByIdRef.current.get(prevId);
      const prevOverlay = overlayRefs.current.get(prevId);
      if (prevItem && prevOverlay) prevOverlay.setContent(buildOverlayHtml(prevItem, false));
    }

    if (selectedId !== null) {
      const item = markersByIdRef.current.get(selectedId);
      const overlay = overlayRefs.current.get(selectedId);
      if (item && overlay) overlay.setContent(buildOverlayHtml(item, true));

      const marker = markerRefs.current.get(selectedId);
      if (marker && mapRef.current) mapRef.current.panTo(marker.getPosition());
    }

    previousSelectedRef.current = selectedId;
  }, [selectedId, sdkReady]);

  // API 키가 없거나 SDK 로드에 실패해도 리스트는 그대로 동작해야 한다 (T-22 완료 판정).
  // 빈 박스만 남기지 않고, 이 영역이 무엇인지 안내한다. 키 미설정과 SDK 로드 실패(주로
  // 카카오 개발자 콘솔에 현재 도메인이 플랫폼으로 등록되지 않은 경우)는 원인이 다르므로
  // 문구를 구분해서 보여준다 — 그래야 "키를 넣었는데도 지도가 안 뜬다"는 문의에서
  // 바로 원인을 좁힐 수 있다.
  if (!hasApiKey || sdkFailed) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1 bg-gray-50 px-4 text-center text-gray-400">
        <span className="text-2xl" aria-hidden="true">
          🗺️
        </span>
        <span className="text-sm font-medium">지도 영역</span>
        <span className="text-xs">
          {sdkFailed
            ? "카카오맵을 불러오지 못했습니다 — 카카오 개발자 콘솔에 현재 접속 도메인이 Web 플랫폼으로 등록돼 있는지 확인하세요 (README 트러블슈팅 참고)"
            : "카카오맵 API 키를 설정하면 이 자리에 약국 위치가 표시됩니다"}
        </span>
      </div>
    );
  }

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
        onError={() => setSdkFailed(true)}
      />
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
}
