"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/hub/AuthLayout";
import FormField from "@/components/hub/FormField";

// 관리자 계정 생성. DB/인증 설계 전이라 저장은 안 하고 데모 대시보드로 바로 넘김.
// 진짜 계정 만든 것처럼 보이면 안 되니까 폼 안에 데모라고 명시해둠
export default function AdminSignupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    router.push("/dashboard");
  };

  return (
    <AuthLayout
      eyebrow="계정 생성"
      title={
        <>
          시설에 <span className="font-hub-body">ANiMA</span>를 연결하세요.
        </>
      }
      description="관리자 계정 하나로 시설 전체를 관리할 수 있습니다."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <FormField label="시설명" name="site" placeholder="예: 행복요양원" autoComplete="organization" />
        <FormField label="관리자 이름" name="name" placeholder="이름" autoComplete="name" />
        <FormField label="이메일" type="email" name="email" placeholder="admin@company.com" autoComplete="email" />
        <FormField label="비밀번호" type="password" name="password" placeholder="••••••••" autoComplete="new-password" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSubmitting ? "이동 중..." : "계정 생성하기"}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-soft">
          지금은 데모입니다. 입력하신 정보는 저장되지 않고, 데모 대시보드로 바로 이동합니다.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-ink-soft">
        이미 계정이 있으신가요?{" "}
        <Link href="/admin/login" className="font-bold text-ink underline underline-offset-4">
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
