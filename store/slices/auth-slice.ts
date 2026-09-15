import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export interface AuthUser {
  id: number;
  nickname: string;
  role: "USER" | "ADMIN";
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isLoading: false,
};

// 실제 토큰 발급은 Next.js Route Handler(app/api/auth/*)를 경유한다.
// refreshToken은 그 Route Handler가 httpOnly 쿠키로만 다루고 여기(클라이언트)엔 절대 오지 않는다.
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.");
    }
    return res.json() as Promise<{ accessToken: string; user: AuthUser }>;
  }
);

export const logout = createAsyncThunk("auth/logout", async (_: void, { getState }) => {
  const accessToken = (getState() as RootState).auth.accessToken;
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
  } catch {
    // 백엔드 호출이 실패해도 클라이언트 세션은 비운다 — 로그아웃은 멱등해야 한다.
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // 401 인터셉터의 refresh 성공 시, 혹은 새로고침 후 세션 복원 시 사용한다.
    setSession: (state, action: PayloadAction<{ accessToken: string; user: AuthUser }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    clearSession: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.accessToken = null;
        state.user = null;
      });
  },
});

export const { setSession, clearSession } = authSlice.actions;
export default authSlice.reducer;
