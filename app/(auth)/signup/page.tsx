"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다.").max(255, "이메일은 최대 255자까지 입력할 수 있습니다."),
  password: z
    .string()
    .min(8, "8~64자로 입력하세요.")
    .max(64, "8~64자로 입력하세요.")
    .regex(/[A-Za-z]/, "영문을 포함해야 합니다.")
    .regex(/\d/, "숫자를 포함해야 합니다."),
  nickname: z.string().min(2, "2~30자로 입력하세요.").max(30, "2~30자로 입력하세요."),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  // app/(auth)/login/page.tsx와 동일한 이유로 onBlur를 쓴다 (docs/ROADMAP.md T-36).
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema), mode: "onBlur" });
  const router = useRouter();

  async function onSubmit(values: SignupFormValues) {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push("/login");
      return;
    }

    const error = await res.json().catch(() => null);
    if (error?.code === "EMAIL_ALREADY_EXISTS") {
      setError("email", { message: "이미 가입된 이메일입니다." });
    } else {
      setError("root", { message: error?.message ?? "회원가입에 실패했습니다." });
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center py-8">
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-none border-2 border-gray-950 bg-white p-8 dark:border-gray-50 dark:bg-gray-900">
      <h1 className="text-center text-xl font-black text-gray-950 dark:text-gray-50">회원가입</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          {errors.email && (
            <p id="email-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-hint password-error" : "password-hint"}
            {...register("password")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          <p id="password-hint" className="text-xs text-gray-400 dark:text-gray-500">
            8~64자, 영문과 숫자를 모두 포함해야 합니다.
          </p>
          {errors.password && (
            <p id="password-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            autoComplete="nickname"
            aria-invalid={!!errors.nickname}
            aria-describedby={errors.nickname ? "nickname-error" : undefined}
            {...register("nickname")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
          />
          {errors.nickname && (
            <p id="nickname-error" role="alert" className="text-xs text-red-600 dark:text-red-400">
              {errors.nickname.message}
            </p>
          )}
        </div>

        {errors.root && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {errors.root.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-none border-2 border-gray-950 bg-gray-950 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-[3px_3px_0_0_#2563eb] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#2563eb] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0_0_#2563eb] disabled:pointer-events-none disabled:opacity-50 dark:border-gray-50 dark:bg-gray-50 dark:text-gray-950 dark:shadow-[3px_3px_0_0_#60a5fa] dark:hover:shadow-[5px_5px_0_0_#60a5fa] dark:active:shadow-[1px_1px_0_0_#60a5fa]"
        >
          {isSubmitting ? "가입하는 중..." : "가입하기"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
          로그인
        </Link>
      </p>
    </div>
    </div>
  );
}
