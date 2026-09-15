import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  userId: number | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  userId: null,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
});

export default authSlice.reducer;
