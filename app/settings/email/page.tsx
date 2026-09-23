import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import EmailForm from "@/components/settings/EmailForm";
import { animaUrl, callAnimaApi, readDisplayUserId, readUserUuid } from "@/lib/anima-api";

export const metadata: Metadata = {
  title: "복구용 이메일 변경 · ANiMA",
};

type AccountInfoResponse = {
  ok?: boolean;
  recovery_email?: string | null;
};

export default async function EmailSettingsPage() {
  const userId = await readDisplayUserId();
  const userUuid = await readUserUuid();

  // TODO: 서버에 계정 정보 조회 API(GET /account/me 같은)가 아직 없습니다.
  // 생기면 이 호출이 그대로 현재 이메일을 채워줍니다.
  const info = userUuid
    ? await callAnimaApi<AccountInfoResponse>(
        animaUrl("/account/me", { user_uuid: userUuid }),
      )
    : null;
  const currentEmail = info?.ok ? (info.data.recovery_email ?? null) : null;

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
            복구용 이메일 변경
          </h1>

          {!userId ? (
            <div className="mt-12 rounded-2xl border border-gray-light bg-steel-surface p-8 text-center">
              <h2 className="text-lg font-bold text-ink">
                로그인이 필요해요
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                계정이 있는 경우에만 이메일을 바꿀 수 있어요.
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
              <EmailForm currentEmail={currentEmail} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
