import type { Metadata } from "next";
import CoughRecorder from "@/components/record/CoughRecorder";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "기침 녹음 · ANiMA",
  description:
    "조용한 곳에서 3초간 기침 소리를 녹음하세요. 로그인 없이 바로 시작할 수 있습니다.",
};

export default function RecordPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <CoughRecorder />
        </div>
      </main>
    </div>
  );
}
