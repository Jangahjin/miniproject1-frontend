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
          content: `<div style="background:${item.rank === 1 ? "#2563eb" : "#111827"};color:#fff;padding:2px 6px;border-radius:4px;font-size:12px;white-space:nowrap;">${item.price.toLocaleString("ko-KR")}원</div>`,
        });
        overlay.setMap(map);

        maps.event.addListener(marker, "click", () => onSelectMarker(item.pharmacyId));

        markerRefs.current.set(item.pharmacyId, marker);
        bounds.extend(position);
      });

      if (!bounds.isEmpty()) map.setBounds(bounds);
      setSdkReady(true);
    });
  }, [markers, userLocation, onSelectMarker]);

  useEffect(() => {
    if (!sdkReady || selectedId === null || !mapRef.current) return;
    const marker = markerRefs.current.get(selectedId);
    if (marker) mapRef.current.panTo(marker.getPosition());
  }, [selectedId, sdkReady]);

  // SDK 로드 실패 시 지도 영역만 숨기고 리스트는 그대로 동작해야 한다 (T-22 완료 판정).
  if (sdkFailed) return null;

  return (
    <>
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onLoad={initMap}
        onError={() => setSdkFailed(true)}
      />
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 400 }} />
    </>
  );
}
