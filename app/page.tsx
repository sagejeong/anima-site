import AuroraBackground from "@/components/AuroraBackground";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* Hero — 제목 / 설명 / 버튼, 그 외에는 두지 않습니다 */}
        <section className="relative flex min-h-[100svh] items-center overflow-hidden">
          <AuroraBackground />

          <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-5 py-28 text-center sm:px-8">
            <h1 className="text-[2.5rem] font-bold leading-[1.2] tracking-tight text-neutral-900 sm:text-6xl sm:leading-[1.15]">
              <span className="block">보통의 기침과 얼마나 다른지,</span>
              <span className="block">3초면 알 수 있습니다.</span>
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-neutral-700 sm:text-2xl sm:leading-relaxed">
              <span className="block">
                여러 사람의 기침 데이터와 비교해 지금 상태를 알려드립니다.
              </span>
              <span className="block">
                기록이 쌓이면, 나만의 기준선이 만들어집니다.
              </span>
            </p>

            <div className="mt-12 flex flex-col items-center gap-4">
              <RecordButton />
              <p className="text-sm text-neutral-600">
                이름도 연락처도 묻지 않습니다.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
