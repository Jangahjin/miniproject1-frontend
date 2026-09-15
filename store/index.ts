import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./slices/location-slice";
import authReducer from "./slices/auth-slice";
import reportDraftReducer from "./slices/report-draft-slice";

export const store = configureStore({
  reducer: {
    location: locationReducer,
    auth: authReducer,
    reportDraft: reportDraftReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
