"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/hub/AuthLayout";
import FormField from "@/components/hub/FormField";

// 관리자 로그인. 인증 서버 아직 없어서 그냥 데모 대시보드로 넘김
export default function AdminLoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    router.push("/dashboard");
  };

  return (
    <AuthLayout
      eyebrow="관리자 로그인"
      title="다시 오셨네요."
      description="시설의 지금 상태를 바로 확인하세요."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="이메일" type="email" name="email" placeholder="admin@company.com" autoComplete="email" />
        <FormField label="비밀번호" type="password" name="password" placeholder="••••••••" autoComplete="current-password" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSubmitting ? "이동 중..." : "로그인"}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-soft">
          지금은 데모입니다. 어떤 정보를 입력하셔도 데모 대시보드로 이동합니다.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        계정이 없으신가요?{" "}
        <Link href="/admin/signup" className="font-bold text-ink underline underline-offset-4">
          계정 생성하기
        </Link>
      </p>
    </AuthLayout>
  );
}
