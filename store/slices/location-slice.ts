import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type LocationState =
  | { status: "idle" | "requesting" }
  | { status: "granted"; lat: number; lng: number; source: "GPS" }
  | { status: "fallback"; lat: number; lng: number; source: "REGION"; regionCode: string }
  | { status: "denied" | "unavailable" };

// `: LocationState =` 형태의 주석 표기는 TS가 초기값 리터럴을 유니온의 첫 멤버로
// 좁혀버려 createSlice의 State 제네릭 추론이 깨진다. `as`로 명시 캐스팅한다.
const initialState = { status: "idle" } as LocationState;

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    requesting: (): LocationState => ({ status: "requesting" }),
    granted: (_state, action: PayloadAction<{ lat: number; lng: number }>): LocationState => ({
      status: "granted",
      lat: action.payload.lat,
      lng: action.payload.lng,
      source: "GPS",
    }),
    fallback: (
      _state,
      action: PayloadAction<{ lat: number; lng: number; regionCode: string }>
    ): LocationState => ({
      status: "fallback",
      lat: action.payload.lat,
      lng: action.payload.lng,
      source: "REGION",
      regionCode: action.payload.regionCode,
    }),
    denied: (): LocationState => ({ status: "denied" }),
    unavailable: (): LocationState => ({ status: "unavailable" }),
    rehydrate: (_state, action: PayloadAction<LocationState>): LocationState => action.payload,
  },
});

export const { requesting, granted, fallback, denied, unavailable, rehydrate } =
  locationSlice.actions;
export default locationSlice.reducer;
