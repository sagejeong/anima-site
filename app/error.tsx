"use client";

import { useEffect } from "react";
import Link from "next/link";
import HeaderClient from "@/components/HeaderClient";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 서버 쪽 로그에만 남기고, 화면에는 기술적인 내용을 보여주지 않음
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <HeaderClient userId={null} />

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          오류
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          잠시 문제가 생겼어요
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          화면을 불러오는 중 오류가 발생했어요. 다시 시도해 주시거나, 문제가
          계속되면 문의해 주세요.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
          >
            다시 시도하기
          </button>
          <Link
            href="/"
            className="text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
