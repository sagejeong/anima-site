import type { Metadata } from "next";
import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "로그인 — ANiMA",
  description: "ANiMA 아이디로 로그인하고 기침 녹음을 이어서 진행하세요.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-md px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            로그인
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            가입할 때 만든 아이디로 로그인해 주세요.
          </p>

          <div className="mt-10">
            <LoginForm />
          </div>

          <p className="mt-10 rounded-xl border border-gray-light bg-neutral-50 p-4 text-xs leading-relaxed text-neutral-600">
            비밀번호를 잊으셨다면 가입 시 입력한 복구용 이메일로 재설정할 수
            있습니다. 이메일을 입력하지 않으셨다면{" "}
            <a
              href="mailto:anima.with@gmail.com"
              className="font-medium text-primary underline underline-offset-4"
            >
              anima.with@gmail.com
            </a>
            로 문의해 주세요.
          </p>
        </div>
      </main>
    </div>
  );
}
