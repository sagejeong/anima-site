import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/hub/AuthLayout";
import { ADMIN_AUTH_COOKIE, isAdminAuthCookieValid } from "@/proxy";

export const metadata: Metadata = {
  title: "대시보드 보기 · ANiMA",
};

// 대시보드로 가기 전에 들르는 선택 화면. 데모버전은 더미 데이터로 동작 방식만
// 보여주고, 실제 팀원 데이터는 관리자 로그인(/admin/login) 후에만 보임.
// 이미 관리자로 로그인된 상태(일반 회원 A의 로그인과는 별개)면 선택 화면 없이
// 바로 실제 대시보드로 보냄
export default async function DashboardStartPage() {
  const cookieStore = await cookies();
  const isAdmin = isAdminAuthCookieValid(cookieStore.get(ADMIN_AUTH_COOKIE)?.value);
  if (isAdmin) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout
      eyebrow="대시보드 보기"
      title="어떻게 보고 싶으세요?"
      description="데모버전은 더미 데이터로 동작 방식만 보여주고, 실제 데이터는 관리자 로그인이 필요합니다."
    >
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard-demo"
          className="flex flex-col gap-1 rounded-2xl border-2 border-line bg-steel-surface px-6 py-5 transition-colors hover:border-primary"
        >
          <span className="text-base font-bold text-ink">데모버전 보기</span>
          <span className="text-sm text-ink-soft">
            더미 데이터로 대시보드가 어떻게 동작하는지 둘러봅니다.
          </span>
        </Link>

        <Link
          href="/admin/login"
          className="flex flex-col gap-1 rounded-2xl bg-primary px-6 py-5 text-white transition-transform hover:-translate-y-0.5"
        >
          <span className="text-base font-bold">관리자 로그인</span>
          <span className="text-sm text-white/80">
            아이디와 비밀번호로 로그인하고 실제 팀원 데이터를 봅니다.
          </span>
        </Link>
      </div>
    </AuthLayout>
  );
}
