import { createSlice } from "@reduxjs/toolkit";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
}

const initialState: LocationState = {
  latitude: null,
  longitude: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
});

export default locationSlice.reducer;
