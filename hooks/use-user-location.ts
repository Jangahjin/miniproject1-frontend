"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  requesting,
  granted,
  fallback,
  denied,
  unavailable,
  rehydrate,
  type LocationState,
} from "@/store/slices/location-slice";

const STORAGE_KEY = "pharmaprice.location";

export function useUserLocation() {
  const location = useSelector((state: RootState) => state.location);
  const dispatch = useDispatch();

  // 탭을 닫았다 다시 열어도 위치가 유지되도록 로컬 스토리지에서 복원한다
  // (세션 스토리지는 탭이 닫히면 사라져 매번 위치 권한을 다시 물어봐야 했다).
  useEffect(() => {
    if (location.status !== "idle") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch(rehydrate(JSON.parse(raw) as LocationState));
      }
    } catch {
      // 시크릿 모드 등 스토리지 접근이 막혀 있으면 idle 상태를 유지한다.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((state: LocationState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시한다 — 위치 기능 자체는 이번 세션 동안 계속 동작한다.
    }
  }, []);

  // GPS 응답은 비동기라, 호출 직후 리렌더 전의 location(클로저)을 읽으면 여전히
  // 이전 상태다. 좌표가 필요한 호출부는 반환된 Promise 결과를 직접 써야 한다.
  const requestLocation = useCallback((): Promise<{ lat: number; lng: number } | null> => {
    dispatch(requesting());

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      dispatch(unavailable());
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const next: LocationState = {
            status: "granted",
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            source: "GPS",
          };
          dispatch(granted({ lat: next.lat, lng: next.lng }));
          persist(next);
          resolve({ lat: next.lat, lng: next.lng });
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            dispatch(denied());
          } else {
            dispatch(unavailable());
          }
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 8000 }
      );
    });
  }, [dispatch, persist]);

  const selectRegion = useCallback(
    (regionCode: string, lat: number, lng: number) => {
      const next: LocationState = { status: "fallback", lat, lng, source: "REGION", regionCode };
      dispatch(fallback({ lat, lng, regionCode }));
      persist(next);
    },
    [dispatch, persist]
  );

  return { location, requestLocation, selectRegion };
}
