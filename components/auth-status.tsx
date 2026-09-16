"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { logout } from "@/store/slices/auth-slice";

export function AuthStatus() {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();

  if (!user) {
    return (
      <Link href="/login" className="font-medium text-blue-600 hover:underline">
        로그인
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-2">
      {user.nickname}님
      <button
        type="button"
        onClick={() => dispatch(logout())}
        className="text-gray-500 hover:text-gray-700 hover:underline"
      >
        로그아웃
      </button>
    </span>
  );
}
