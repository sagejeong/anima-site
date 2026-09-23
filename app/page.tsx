import Image from "next/image";
import Link from "next/link";
import FeatureShowcase from "@/components/hub/FeatureShowcase";
import Header from "@/components/Header";
import HeroGraphic from "@/components/hub/HeroGraphic";

const STEPS = [
  {
    title: "녹음",
    description: "조용한 곳에서 3초 이상 기침 소리를 녹음합니다. 로그인 없이 바로 시작할 수 있습니다.",
  },
  {
    title: "실제 AI 분석",
    description: "기침 여부를 분류하고, 건강한 기준 패턴 대비 얼마나 벗어났는지 계산합니다.",
  },
  {
    title: "결과 확인",
    description: "개인은 그 자리에서 결과를, 요양시설 관리자는 대시보드에서 전 입소자의 변화를 확인합니다.",
  },
] as const;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-steel font-hub-body text-ink">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* 히어로 */}
        <section className="px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-40 lg:px-12">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl animate-fade-up">
              <p className="font-hub-label text-sm font-bold uppercase tracking-[0.3em] text-ink-soft">
                AI 기침 분석
              </p>

              <h1 className="mt-6 font-hub-display text-5xl font-black leading-[1.05] tracking-tight text-balance sm:text-6xl">
                <span className="gradient-brand-text">기침 소리</span>로
                <br />
                호흡 건강을 읽습니다.
              </h1>

              <p className="mt-7 text-pretty text-lg leading-relaxed text-ink-soft">
                녹음 한 번으로 실제 AI 분석 결과를 확인하고, 요양시설에서는
                입소자의 오전/오후 변화를 대시보드 하나로 관리하세요. 지금
                바로 눌러서 직접 써볼 수 있습니다.
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/record"
                  className="inline-flex items-center justify-center rounded-full gradient-brand-bg px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
                >
                  지금 기침 체크하기
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink px-7 py-3.5 text-base font-bold text-ink transition-colors hover:bg-ink hover:text-steel"
                >
                  대시보드 보기
                </Link>
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:120ms]">
              <HeroGraphic />
            </div>
          </div>
        </section>

        {/* 스탯 스트립 */}
        <section className="border-y border-line bg-steel-surface">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 divide-y divide-line px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8 lg:px-12">
            <Stat value="3초" label="녹음만으로 분석 시작" />
            <Stat value="하루 2회" label="오전 · 오후 체크인" />
            <Stat value="한 화면" label="전 입소자 동시 확인" />
          </div>
        </section>

        {/* 만든 것: 진짜 기능 카테고리 */}
        <section id="capabilities" className="scroll-mt-16 px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto w-full max-w-6xl">
            <p className="font-hub-label text-sm font-bold uppercase tracking-[0.3em] text-primary">
              기능
            </p>
            <h2 className="mt-3 font-hub-display text-3xl font-black tracking-tight text-balance sm:text-4xl">
              우리가 이미 만든 것들
            </h2>
            <p className="mt-3 max-w-2xl text-pretty text-ink-soft">
              시안이 아닙니다. 아래 두 가지는 지금 눌러서 바로 확인할 수 있는 실제 기능입니다.
            </p>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <Link
                href="/record"
                className="group flex flex-col justify-between rounded-3xl border border-line bg-steel-surface p-8 transition-colors hover:border-primary"
              >
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MicIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 font-hub-display text-2xl font-bold tracking-tight">기침 녹음 · 분석</h3>
                  <p className="mt-3 text-pretty leading-relaxed text-ink-soft">
                    3초만 녹음하면 실제 AI 모델이 기침을 분류하고, 건강한 기준
                    패턴 대비 얼마나 벗어났는지 그 자리에서 알려드립니다.
                    로그인 없이 바로 시작할 수 있습니다.
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 font-bold text-primary">
                  지금 테스트하기
                  <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>

              <div className="flex flex-col justify-between rounded-3xl border border-line bg-steel-surface p-8">
                <div>
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <GridIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 font-hub-display text-2xl font-bold tracking-tight">요양시설 대시보드</h3>
                  <p className="mt-3 text-pretty leading-relaxed text-ink-soft">
                    입소자가 본인 폰으로 오전/오후 체크인하면, 그 실제 분석
                    결과가 관리자 대시보드에 그대로 나타납니다.
                  </p>
                  <div className="mt-6">
                    <FeatureShowcase />
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <Link href="/dashboard" className="group inline-flex items-center gap-2 font-bold text-primary">
                    대시보드 열어보기
                    <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/checkin" className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink">
                    입소자 체크인 화면 보기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 작동 방식: 반전 대비 섹션(어두운 배경으로 리듬 끊어줌) */}
        <section id="how" className="scroll-mt-16 bg-inverted px-5 py-20 text-inverted-ink sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto w-full max-w-5xl">
            <p className="font-hub-label text-sm font-bold uppercase tracking-[0.3em] text-primary">
              작동 방식
            </p>
            <h2 className="mt-3 font-hub-display text-3xl font-black tracking-tight text-balance sm:text-4xl">
              세 단계로 끝납니다
            </h2>

            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              {STEPS.map((step, index) => (
                <div key={step.title}>
                  <span className="font-hub-label text-3xl font-bold text-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-hub-display text-lg font-bold tracking-tight text-inverted-ink">{step.title}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-inverted-ink/70 sm:text-base sm:leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 클로징 CTA */}
        <section className="bg-charcoal px-5 py-24 text-center sm:px-8">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6">
            <h2 className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-hub-display text-3xl font-black tracking-tight text-balance text-ink sm:text-4xl">
              <span>지금,</span>
              <Image
                src="/anima_logo.png"
                alt="ANiMA"
                width={774}
                height={158}
                className="h-8 w-auto sm:h-10"
              />
              <span>를 시작하세요.</span>
            </h2>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/record"
                className="inline-flex items-center justify-center rounded-full gradient-brand-bg px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-transform hover:-translate-y-0.5"
              >
                기침 체크하기
              </Link>
              <Link
                href="/admin/signup"
                className="inline-flex items-center justify-center rounded-full border-2 border-ink/30 px-8 py-3.5 text-base font-bold text-ink transition-colors hover:border-ink"
              >
                관리자 계정 생성하기
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <Image src="/anima_logo.png" alt="ANiMA" width={774} height={158} className="h-4 w-auto opacity-70" />
          <p className="text-xs text-ink-soft">
            ANiMA · 기침 소리로 읽는 호흡 건강 ·{" "}
            <a href="mailto:anima.with@gmail.com" className="underline underline-offset-4 hover:text-ink">
              anima.with@gmail.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-8 text-center sm:py-10">
      <span className="font-hub-label text-4xl font-extrabold text-ink sm:text-5xl">{value}</span>
      <span className="text-sm font-medium text-ink-soft">{label}</span>
    </div>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
