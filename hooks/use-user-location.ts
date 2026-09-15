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

  // 앱 시작 시 이전에 고른 위치를 세션 스토리지에서 복원한다.
  useEffect(() => {
    if (location.status !== "idle") return;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
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
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 저장 실패는 무시한다 — 위치 기능 자체는 이번 세션 동안 계속 동작한다.
    }
  }, []);

  const requestLocation = useCallback(() => {
    dispatch(requesting());

    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      dispatch(unavailable());
      return;
    }

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
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          dispatch(denied());
        } else {
          dispatch(unavailable());
        }
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
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
