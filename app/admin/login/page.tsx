"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/hub/AuthLayout";
import FormField from "@/components/hub/FormField";

// 관리자 로그인. 팀이 같이 쓰는 공용 비밀번호 하나로 대시보드 전체를 잠가둠
function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setErrorMessage(body?.error ?? "로그인하지 못했습니다.");
        setIsSubmitting(false);
        return;
      }

      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch {
      setErrorMessage("네트워크에 연결하지 못했습니다.");
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="관리자 로그인"
      title="다시 오셨네요."
      description="팀이 같이 쓰는 비밀번호로 대시보드에 들어갑니다."
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
        <FormField
          label="비밀번호"
          type="password"
          name="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />

        {errorMessage && (
          <p role="alert" className="text-sm font-bold text-critical">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSubmitting ? "확인 중..." : "로그인"}
        </button>
      </form>
    </AuthLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
