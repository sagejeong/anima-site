"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/form/Fields";

type LoginErrors = {
  userId?: string;
  password?: string;
  form?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const nextErrors: LoginErrors = {};
    if (userId.trim() === "") {
      nextErrors.userId = "아이디를 입력해 주세요.";
    }
    if (password === "") {
      nextErrors.password = "비밀번호를 입력해 주세요.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password }),
      });

      if (!response.ok) {
        setErrors({
          form:
            response.status === 401
              ? "아이디 또는 비밀번호가 올바르지 않습니다."
              : "로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        });
        return;
      }

      router.push("/record");
      router.refresh();
    } catch {
      setErrors({ form: "네트워크에 연결하지 못했습니다." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="space-y-5">
        <TextField
          id="loginUserId"
          label="아이디"
          value={userId}
          onChange={(value) => {
            setUserId(value);
            setErrors((prev) => ({ ...prev, userId: undefined, form: undefined }));
          }}
          placeholder="anima_user01"
          autoComplete="username"
          error={errors.userId}
        />

        <TextField
          id="loginPassword"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(value) => {
            setPassword(value);
            setErrors((prev) => ({
              ...prev,
              password: undefined,
              form: undefined,
            }));
          }}
          autoComplete="current-password"
          error={errors.password}
        />
      </div>

      {errors.form && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {errors.form}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60"
      >
        {isSubmitting ? "로그인하는 중..." : "로그인"}
      </button>

      <p className="mt-6 text-center text-sm text-neutral-500">
        아직 계정이 없으신가요?{" "}
        <Link
          href="/signup"
          className="font-semibold text-primary underline underline-offset-4"
        >
          회원가입
        </Link>
      </p>
    </form>
  );
}
