import Link from "next/link";
import Header from "@/components/Header";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-5 py-28 text-center sm:px-8">
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          페이지를 찾을 수 없어요
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          주소가 바뀌었거나 잘못 입력하셨을 수 있어요. 주소를 다시 확인하거나
          홈으로 돌아가 주세요.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          홈으로 돌아가기
        </Link>
      </main>
    </div>
  );
}
