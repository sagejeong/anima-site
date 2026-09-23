import type { Metadata } from "next";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";

export const metadata: Metadata = {
  title: "ANiMA 소개 · 기침 소리로 만드는 나만의 호흡기 기준선",
  description:
    "ANiMA는 한국인 기침 데이터셋을 기반으로, 마할라노비스 거리를 이용해 개인별 기침 소리의 변화를 분석하는 연구 프로젝트입니다.",
};

// TODO: 문구 검수 필요, 연구 내용에 맞게 표현/수치 확인 후 수정
export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-steel-surface">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* 페이지 히어로 */}
        <section className="relative overflow-hidden bg-linear-to-b from-primary/10 via-steel-surface to-steel-surface">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-1/2 h-105 w-105 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
          />

          <div className="relative mx-auto w-full max-w-3xl px-5 pb-20 pt-28 text-center sm:px-8 sm:pb-28 sm:pt-40">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl sm:leading-tight">
              <span className="block">기침 소리로 만드는</span>
              <span className="block">나만의 호흡기 기준선</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
              ANiMA는 기침 소리를 녹음해 그 사람의 평소 기침이 어떤 모습인지
              기록하고, 오늘의 기침이 그 평소와 얼마나 달라졌는지를 숫자로
              보여주는 연구용 앱입니다.
            </p>
          </div>
        </section>

        {/* 본문 */}
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
          <Section
            eyebrow="ANiMA란"
            title="기준 패턴에 내 기침을 견주어봅니다"
          >
            <p>
              기침 소리에는 숨이 지나온 길의 상태가 담깁니다. 같은 사람이라도
              컨디션에 따라 소리의 높낮이, 세기, 길이가 조금씩 달라집니다.
            </p>
            <p>
              ANiMA는 이 미세한 차이를 사람의 귀 대신 수치로 붙잡습니다. 지금은{" "}
              <Em>특별한 증상이 없는 사람들의 기침 데이터</Em>로 만든 기준
              패턴을 두고, 녹음하신 기침이 그 패턴에서 얼마나 벗어나 있는지를
              알려드립니다.
            </p>
            <p>
              기록이 충분히 쌓이면 그다음 단계로 넘어갑니다. 사람마다 기침
              소리가 다르기 때문에, <Em>각자의 기준선</Em>을 만들어 어제의 나와
              비교하는 방식이 더 정확합니다. 개인별 기준선 분석은 현재 준비
              중입니다.
            </p>
          </Section>

          <Section
            eyebrow="왜 한국인 데이터셋인가"
            title="빌려 온 기준으로는 정확히 잴 수 없습니다"
          >
            <p>
              현재 널리 쓰이는 공개 기침 데이터셋(COUGHVID, Coswara 등)은 주로
              서구권 화자의 음성을 바탕으로 만들어졌습니다.
            </p>
            <p>
              소리는 목에서 입까지 이어지는 통로(성도)를 지나며 특정 주파수
              대역에서 크게 울립니다. 이 울림 지점을 <Em>포먼트 주파수</Em>라고
              부르는데, 통로의 길이와 모양이 다르면 이 값도 달라집니다. 한국인의
              성도 구조에서 비롯되는 차이가 기존 데이터셋에는 충분히 반영되어
              있지 않습니다.
            </p>
            <p>
              그래서 ANiMA는 한국인 전용 기침 데이터셋을 직접 구축하고, 그 위에서
              더 정확한 분석 기준을 만드는 것을 목표로 합니다.
            </p>
          </Section>

          <Section
            eyebrow="분석 과정"
            title="기침 소리는 이렇게 분석됩니다"
          >
            <p>
              녹음 버튼을 누른 뒤 리포트가 나오기까지, 안에서는 네 단계가
              진행됩니다.
            </p>

            <ol className="mt-8 space-y-4">
              {ANALYSIS_STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex gap-4 rounded-2xl border border-gray-light/70 bg-steel-surface p-5 sm:gap-5 sm:p-6"
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-ink sm:text-lg">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* 마할라노비스 거리 쉬운 설명 */}
            <div className="mt-8 rounded-2xl border border-dot-blue/30 bg-dot-blue/5 p-5 sm:p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-ink sm:text-lg">
                <span
                  className="h-2 w-2 rounded-full bg-dot-blue"
                  aria-hidden="true"
                />
                마할라노비스 거리가 뭔가요?
              </h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
                <p>
                  두 값이 얼마나 떨어져 있는지를 재는 방법 중 하나입니다. 자로
                  재듯 단순히 거리를 재면, 원래부터 들쭉날쭉한 항목이든 늘
                  일정하던 항목이든 똑같은 잣대로 취급하게 됩니다.
                </p>
                <p>
                  마할라노비스 거리는 각 항목이 평소 얼마나 흔들리는지, 그리고
                  항목끼리 얼마나 함께 움직이는지를 함께 계산합니다. 그래서 평소
                  변동이 큰 특징이 조금 달라진 것은 대수롭지 않게 보고, 늘
                  일정하던 특징이 흔들린 것은 크게 반영합니다.
                </p>
                <p className="font-medium text-ink">
                  한 문장으로 줄이면, 내 기침이 기준 패턴으로부터 몇 걸음이나
                  떨어져 있는지를 재는 자입니다.
                </p>
              </div>
            </div>
          </Section>

          <Section eyebrow="연구 배경" title="목소리로 몸 상태를 읽는 연구 위에서">
            <p>
              사람의 목소리를 분석해 호흡기 상태를 살피는 연구는 이미 높은
              민감도를 보여 왔습니다. ANiMA는 그 선행 연구들을 토대로, 기침이라는
              더 짧고 분명한 소리에 개인별 기준선이라는 관점을 더했습니다.
            </p>
          </Section>

          <Section eyebrow="녹음 안내" title="처음 참여하실 때 이렇게 진행됩니다">
            <ul className="grid gap-3 sm:grid-cols-2">
              {RECORDING_TIPS.map((tip) => (
                <li
                  key={tip}
                  className="flex gap-3 rounded-xl border border-gray-light/70 bg-steel-surface p-4 text-sm leading-relaxed text-ink-soft sm:text-base"
                >
                  <CheckIcon />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section eyebrow="개인정보" title="연구 참여는 언제나 자발적입니다">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>참여 여부는 전적으로 본인의 선택이며, 언제든 그만둘 수 있습니다.</li>
              <li>
                분석을 요청하지 않으시면 개인을 식별할 수 있는 정보는 포함되지
                않습니다.
              </li>
              <li>
                분석을 요청하시더라도 가입 시 만든 ID 정도만 식별 번호로 쓰이고,
                이름·연락처 같은 인적사항은 저장하지 않습니다.
              </li>
              <li>
                모든 절차는 몸에 어떤 것도 삽입하지 않는 비침습적 방식으로만
                이루어집니다.
              </li>
            </ul>
          </Section>

          {/* 의료 면책 */}
          <div className="mt-14 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
            <h2 className="text-base font-semibold text-ink sm:text-lg">
              알아두실 점
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
              현재 ANiMA는 의료적 진단을 제공하지 않습니다. 지금 제공되는 것은 내
              기침이 기준 패턴과 얼마나 달라졌는지에 대한 참고 기록이며, 더
              정교한 비교 도구는 연구가 진행된 뒤 추후 앱에 통합될 예정입니다.
              증상이 계속되거나 심해진다면 반드시 의료기관에서 진료를 받으시기
              바랍니다.
            </p>
          </div>

          {/* 문의 + CTA */}
          <div className="mt-14 flex flex-col items-center gap-5 rounded-3xl border border-gray-light/70 bg-steel-surface px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              연구에 참여해 주시겠어요?
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
              첫 녹음 전에 연구 목적과 데이터 이용에 대한 동의 안내를 한 번 더
              보여드립니다.
            </p>
            <RecordButton className="mt-2" />
            <p className="text-xs text-ink-soft sm:text-sm">
              문의{" "}
              <a
                href="mailto:anima.with@gmail.com"
                className="font-medium text-primary underline underline-offset-4"
              >
                anima.with@gmail.com
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

type AnalysisStep = {
  title: string;
  description: string;
};

const ANALYSIS_STEPS: readonly AnalysisStep[] = [
  {
    title: "기침 소리 녹음",
    description:
      "조용한 곳에서 기기를 얼굴에서 약 20cm 떨어뜨리고 기침 소리를 녹음합니다. 주변 소음이 적을수록 분석의 정확도가 올라갑니다.",
  },
  {
    title: "소리를 숫자로 바꾸기",
    description:
      "녹음된 소리에서 주파수 분포, 소리의 세기, 지속 시간, 파형의 거칠기 등 여러 음향 특징을 한꺼번에 뽑아냅니다. 하나의 기침이 여러 개의 숫자 묶음으로 바뀝니다.",
  },
  {
    title: "기준 패턴과 맞춰보기",
    description:
      "특별한 증상이 없는 사람들의 기침 데이터가 이루는 범위를 기준으로 삼습니다. 이 기준은 공개 데이터셋(COUGHVID)에서 만들어졌습니다.",
  },
  {
    title: "얼마나 벗어났는지 재기",
    description:
      "녹음한 기침이 그 범위에서 얼마나 떨어져 있는지를 마할라노비스 거리로 계산해, 양호·주의·경고 세 구간으로 보여드립니다.",
  },
] as const;

const RECORDING_TIPS: readonly string[] = [
  "전체 녹음과 데이터 수집에 약 5분 정도 걸립니다.",
  "녹음 중에는 기기를 얼굴에서 약 20cm 떨어뜨려 주세요.",
  "가능한 한 조용한 환경에서 녹음해 주세요.",
  "녹음 기기는 세척·소독 전에 다른 사람과 공유하지 말아 주세요.",
] as const;

type SectionProps = {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
};

/** 소개 페이지 공통 섹션 레이아웃 */
function Section({ eyebrow, title, children }: SectionProps) {
  return (
    <section className="mt-16 first:mt-4 sm:mt-20">
      <p className="text-sm font-semibold text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
        {children}
      </div>
    </section>
  );
}

/** 본문 중 강조 표현 */
function Em({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-ink">{children}</strong>;
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-5 w-5 shrink-0 text-primary"
      aria-hidden="true"
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
