import { createSlice } from "@reduxjs/toolkit";

interface ReportDraftState {
  pharmacyName: string;
  medicineName: string;
  price: number | null;
}

const initialState: ReportDraftState = {
  pharmacyName: "",
  medicineName: "",
  price: null,
};

const reportDraftSlice = createSlice({
  name: "reportDraft",
  initialState,
  reducers: {},
});

export default reportDraftSlice.reducer;
