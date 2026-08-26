import type { Metadata } from "next";
import Header from "@/components/Header";
import ResultView from "@/components/record/ResultView";

export const metadata: Metadata = {
  title: "분석 결과 — ANiMA",
  description: "기준 패턴과 비교한 내 기침 분석 결과입니다.",
};

export default function ResultPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            분석 결과
          </h1>

          <div className="mt-12">
            <ResultView />
          </div>
        </div>
      </main>
    </div>
  );
}
