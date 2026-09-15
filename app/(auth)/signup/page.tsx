"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <h1>회원가입</h1>

      <label htmlFor="email">이메일</label>
      <input id="email" type="email" {...register("email")} />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <label htmlFor="password">비밀번호</label>
      <input id="password" type="password" {...register("password")} />
      {errors.password && <p role="alert">{errors.password.message}</p>}

      <label htmlFor="nickname">닉네임</label>
      <input id="nickname" type="text" {...register("nickname")} />
      {errors.nickname && <p role="alert">{errors.nickname.message}</p>}

      {errors.root && <p role="alert">{errors.root.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        가입하기
      </button>
    </form>
  );
}
