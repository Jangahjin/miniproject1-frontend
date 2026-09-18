"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "@/store";
import { login } from "@/store/slices/auth-slice";

const loginSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다."),
  password: z.string().min(1, "비밀번호를 입력하세요."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  // mode 기본값(onSubmit)에서는 이 RHF/React 조합에서 첫 제출 실패 시 formState.errors가
  // 렌더에 반영되지 않아 에러가 보이지 않는 버그가 있었다 (docs/ROADMAP.md T-36에서 발견).
  // onBlur로 바꾸면 같은 값이 blur 시점에 정상 반영된다 — 탭 이동도 blur를 유발하므로
  // 키보드 흐름과도 맞는다.
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema), mode: "onBlur" });
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();

  async function onSubmit(values: LoginFormValues) {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      router.push(searchParams.get("next") ?? "/");
    } else {
      setError("root", { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <h1 className="text-center text-xl font-bold text-gray-900">로그인</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p role="alert" className="text-sm text-red-600">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:underline">
          회원가입
        </Link>
      </p>
    </div>
  );
}
