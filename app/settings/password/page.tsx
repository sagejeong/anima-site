import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import PasswordForm from "@/components/settings/PasswordForm";
import { readDisplayUserId } from "@/lib/anima-api";

export const metadata: Metadata = {
  title: "비밀번호 변경 · ANiMA",
};

export default async function PasswordSettingsPage() {
  const userId = await readDisplayUserId();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <Link
            href="/settings"
            className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-primary"
          >
            ← 설정으로
          </Link>

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            비밀번호 변경
          </h1>

          {!userId ? (
            <div className="mt-12 rounded-2xl border border-gray-light bg-steel-surface p-8 text-center">
              <h2 className="text-lg font-bold text-ink">
                로그인이 필요해요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                계정이 있는 경우에만 비밀번호를 바꿀 수 있어요.
              </p>
              <Link
                href="/login"
                className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
              >
                로그인
              </Link>
            </div>
          ) : (
            <div className="mt-12">
              <PasswordForm />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
