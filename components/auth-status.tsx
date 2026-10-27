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
      <Link href="/login" className="btn-primary h-9 px-4 py-0 text-[13px]">
        로그인
      </Link>
    );
  }

  return (
    <span className="flex items-center gap-1 text-[13px] font-semibold">
      {user.role === "ADMIN" && (
        <Link href="/admin" className="rounded-control px-2.5 py-2 text-sub hover:bg-mist hover:text-ink dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100">
          관리자
        </Link>
      )}
      <Link href="/me" className="rounded-control px-2.5 py-2 text-ink hover:bg-mist dark:text-gray-200 dark:hover:bg-gray-800">
        {user.nickname}님
      </Link>
      <button
        type="button"
        onClick={() => dispatch(logout())}
        className="rounded-control px-2.5 py-2 text-sub hover:bg-mist hover:text-ink dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      >
        로그아웃
      </button>
    </span>
  );
}
