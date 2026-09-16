"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";

const signupSchema = z.object({
  email: z.string().email("올바른 이메일 형식이 아닙니다.").max(255),
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
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });
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
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <h1 className="text-center text-xl font-bold text-gray-900">회원가입</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register("email")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.email && (
            <p role="alert" className="text-xs text-red-600">
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
            autoComplete="new-password"
            {...register("password")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <p className="text-xs text-gray-400">8~64자, 영문과 숫자를 모두 포함해야 합니다.</p>
          {errors.password && (
            <p role="alert" className="text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="nickname" className="text-sm font-medium text-gray-700">
            닉네임
          </label>
          <input
            id="nickname"
            type="text"
            autoComplete="nickname"
            {...register("nickname")}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          {errors.nickname && (
            <p role="alert" className="text-xs text-red-600">
              {errors.nickname.message}
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
          {isSubmitting ? "가입하는 중..." : "가입하기"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
