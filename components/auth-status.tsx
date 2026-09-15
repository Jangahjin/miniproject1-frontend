"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/slices/auth-slice";

export function AuthStatus() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  if (!user) {
    return <Link href="/login">로그인</Link>;
  }

  return (
    <span>
      {user.nickname}님{" "}
      <button type="button" onClick={() => dispatch(logout())}>
        로그아웃
      </button>
    </span>
  );
}
