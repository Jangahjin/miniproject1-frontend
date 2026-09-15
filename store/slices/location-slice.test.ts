import { describe, it, expect } from "vitest";
import locationReducer, {
  requesting,
  granted,
  fallback,
  denied,
  unavailable,
  rehydrate,
} from "./location-slice";

describe("locationSlice", () => {
  it("초기 상태는 idle이다", () => {
    expect(locationReducer(undefined, { type: "@@INIT" })).toEqual({ status: "idle" });
  });

  it("requesting은 상태를 requesting으로 바꾼다", () => {
    expect(locationReducer({ status: "idle" }, requesting())).toEqual({ status: "requesting" });
  });

  it("granted는 GPS 좌표를 저장한다", () => {
    const state = locationReducer({ status: "requesting" }, granted({ lat: 37.5, lng: 127.0 }));
    expect(state).toEqual({ status: "granted", lat: 37.5, lng: 127.0, source: "GPS" });
  });

  it("fallback은 지역 코드와 좌표를 저장한다", () => {
    const state = locationReducer(
      { status: "requesting" },
      fallback({ lat: 37.5, lng: 127.0, regionCode: "11110" })
    );
    expect(state).toEqual({
      status: "fallback",
      lat: 37.5,
      lng: 127.0,
      source: "REGION",
      regionCode: "11110",
    });
  });

  it("denied / unavailable은 좌표 없이 상태만 바꾼다", () => {
    expect(locationReducer({ status: "requesting" }, denied())).toEqual({ status: "denied" });
    expect(locationReducer({ status: "requesting" }, unavailable())).toEqual({
      status: "unavailable",
    });
  });

  it("rehydrate는 저장된 상태를 그대로 복원한다", () => {
    const saved = { status: "granted", lat: 1, lng: 2, source: "GPS" } as const;
    expect(locationReducer({ status: "idle" }, rehydrate(saved))).toEqual(saved);
  });
});
