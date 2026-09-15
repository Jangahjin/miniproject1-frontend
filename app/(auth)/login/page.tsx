"use client";

import { Suspense } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>로그인</h1>

      <label htmlFor="email">이메일</label>
      <input id="email" type="email" {...register("email")} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="password">비밀번호</label>
      <input id="password" type="password" {...register("password")} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      {errors.root && <p role="alert">{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        로그인
      </button>
    </form>
  );
}
