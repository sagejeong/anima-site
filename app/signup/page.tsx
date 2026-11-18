import type { Metadata } from "next";
import Header from "@/components/Header";
import SignupFlow from "@/components/signup/SignupFlow";

export const metadata: Metadata = {
  title: "서비스 이용 동의 · ANiMA",
  description:
    "ANiMA 이용을 위한 동의 안내. 계정을 만들지 않아도 이용할 수 있습니다.",
};

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-steel-surface">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32">
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            <span className="font-hub-body">ANiMA</span> 서비스 이용 동의
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base">
            동의만 하면 바로 시작할 수 있습니다. 계정을 만들지 않아도 이용할 수
            있고, 이름과 연락처는 받지 않습니다.
          </p>

          <div className="mt-10">
            <SignupFlow />
          </div>
        </div>
      </main>
    </div>
  );
}
