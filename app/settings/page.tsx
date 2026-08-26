import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import SettingsMenu from "@/components/settings/SettingsMenu";
import { readDisplayUserId } from "@/lib/anima-api";

export const metadata: Metadata = {
  title: "설정 — ANiMA",
};

export default async function SettingsPage() {
  const userId = await readDisplayUserId();

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            설정
          </h1>

          <div className="mt-12">
            {userId ? (
              <SettingsMenu userId={userId} />
            ) : (
              <div className="rounded-2xl border border-gray-light bg-white p-8 text-center">
                <h2 className="text-lg font-bold text-neutral-900">
                  로그인이 필요해요
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  계정이 있는 경우에만 설정을 볼 수 있어요.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
                >
                  로그인
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
