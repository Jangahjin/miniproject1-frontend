import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ReportDraft {
  pharmacyId: number | null;
  pharmacyName: string;
  drugId: number | null;
  drugName: string;
  packageUnit: string;
  price: string;
  purchasedAt: string;
  memo: string;
}

const initialState: ReportDraft = {
  pharmacyId: null,
  pharmacyName: "",
  drugId: null,
  drugName: "",
  packageUnit: "",
  price: "",
  purchasedAt: "",
  memo: "",
};

const reportDraftSlice = createSlice({
  name: "reportDraft",
  initialState,
  reducers: {
    setDraft: (state, action: PayloadAction<Partial<ReportDraft>>) => {
      Object.assign(state, action.payload);
    },
    clearDraft: () => initialState,
  },
});

export const { setDraft, clearDraft } = reportDraftSlice.actions;
export default reportDraftSlice.reducer;
