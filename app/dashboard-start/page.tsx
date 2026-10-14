import type { Metadata } from "next";
import Link from "next/link";
import AuthLayout from "@/components/hub/AuthLayout";

export const metadata: Metadata = {
  title: "대시보드 보기 · ANiMA",
};

// 대시보드로 가기 전에 들르는 선택 화면. 일반 회원은 예시 데이터만 보고,
// 관리자는 /admin/login에서 아이디+비밀번호를 입력해야 실제 데이터로 들어감
export default function DashboardStartPage() {
  return (
    <AuthLayout
      eyebrow="대시보드 보기"
      title="어떻게 보고 싶으세요?"
      description="일반 회원은 예시 데이터로 동작 방식만 둘러볼 수 있고, 실제 입소자 데이터는 관리자 로그인이 필요합니다."
    >
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex flex-col gap-1 rounded-2xl border-2 border-line bg-steel-surface px-6 py-5 transition-colors hover:border-primary"
        >
          <span className="text-base font-bold text-ink">일반 회원으로 보기</span>
          <span className="text-sm text-ink-soft">
            예시 데이터로 대시보드가 어떻게 동작하는지 둘러봅니다.
          </span>
        </Link>

        <Link
          href="/admin/login"
          className="flex flex-col gap-1 rounded-2xl bg-primary px-6 py-5 text-white transition-transform hover:-translate-y-0.5"
        >
          <span className="text-base font-bold">관리자 로그인</span>
          <span className="text-sm text-white/80">
            아이디와 비밀번호로 로그인하고 실제 입소자 데이터를 봅니다.
          </span>
        </Link>
      </div>
    </AuthLayout>
  );
}
