import type { Metadata } from "next";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";

export const metadata: Metadata = {
  title: "ANiMA 소개 · 기침 소리로 살펴보는 내 기침의 변화",
  description:
    "ANiMA는 스마트폰으로 녹음한 기침 소리를 건강한 사람들의 기침 기준 분포와 비교해, 얼마나 다른지 수치와 기록으로 보여주는 기침 자가 모니터링 연구 프로젝트입니다.",
};

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
              기침 소리로 살펴보는 내 기침의 변화
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
              기침, 그냥 넘기고 계셨나요? 스마트폰으로 기침 소리를 녹음하면
              ANiMA가 건강한 사람들의 기침과 얼마나 다른지 알려드립니다. 병명을
              알려드리지는 않습니다. 대신 기록이 하나둘 쌓이니, &lsquo;요즘
              기침이 좀 달라졌나?&rsquo; 싶을 때 꺼내 보실 수 있습니다.
            </p>
          </div>
        </section>

        {/* 본문 */}
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 sm:px-8 sm:pb-32">
          <Section eyebrow="ANiMA란" title="꾸준한 자가 모니터링 도구">
            <p>
              만성 기침은 일상과 삶의 질에 오래 영향을 주지만, 내 기침이 어떤
              상태인지, 요즘 달라졌는지를 스스로 객관적으로 알기는 어렵습니다.
            </p>
            <p>
              진료 때 증상을 설명하는 방법이 주로 기억이나 설문이다 보니, 몇
              주에서 몇 달에 걸친 변화를 꾸준히 기록하고 전달하기도 쉽지
              않습니다.
            </p>
            <p>
              ANiMA는 스마트폰으로 기침 소리를 녹음하고, 음향을 분석해 기침
              패턴이 어떻게 변하는지를 숫자와 기록으로 남깁니다. 사람마다
              기침 소리가 다르기 때문에, 앞으로는 각자의 평소 기침을 기준으로
              변화를 살피는 방식으로 발전시키려 합니다.
            </p>
            <p>
              ANiMA의 목적은 <Em>질병 진단이 아니라</Em>, 스스로 상태 변화를
              살피고 진료 때 의료진에게 보여줄 객관적인 기록을 쌓는 것입니다.
            </p>
          </Section>

          <Section
            eyebrow="왜 한국인 데이터셋인가"
            title="해외 데이터만으로는 충분하지 않습니다"
          >
            <p>
              현재 ANiMA의 기준 분포는 해외 공개 기침 데이터셋(COUGHVID)으로
              만들었습니다. 녹음 환경도 사용자 특성도 다른 해외 데이터가
              국내 사용자에게 얼마나 잘 맞는지는 아직 더 확인해야 합니다.
            </p>
            <p>
              그래서 팀원들이 대중교통, 집, 실외에서 국내 생활 소음을 직접
              녹음해 기침 판별 모델 학습에 썼습니다.
            </p>
            <p>
              앞으로는 이 사이트를 통해 국내 기침 데이터를 모아, 국내 환경에
              맞는 기준을 만들어 가려 합니다.
            </p>
          </Section>

          <Section eyebrow="어떻게 분석하나" title="녹음 한 번이 숫자가 되기까지">
            <p>
              녹음 버튼을 누른 뒤 결과가 나오기까지, 안에서는 다섯 단계가
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
                  어떤 값이 기준이 되는 데이터 무리에서 얼마나 떨어져 있는지를
                  재는 방법입니다. 자로 재듯 단순히 거리를 재면, 원래부터
                  들쭉날쭉한 항목이든 늘 일정하던 항목이든 똑같은 잣대로
                  취급하게 됩니다.
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

            {/* 신뢰도 점수 안내 */}
            <p className="mt-6 rounded-xl border border-gray-light/70 bg-steel-surface p-4 text-sm leading-relaxed text-ink-soft sm:p-5 sm:text-base sm:leading-relaxed">
              결과와 함께 신뢰도 점수도 보여드립니다. 기침일 확률(70%)과
              녹음 품질(30%)을 합친 점수로, 이번 녹음을 분석에 얼마나 믿고
              쓸 수 있는지를 나타냅니다. 이탈도와는 별개의 점수입니다. 구간
              경계값과 가중치는 현재 초기값이며, 검증을 거쳐 보완할
              예정입니다.
            </p>
          </Section>

          <Section eyebrow="연구 배경" title="만성 기침, 기록하기 어려운 증상">
            <div className="grid gap-3 sm:grid-cols-2">
              {BACKGROUND_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-light/70 bg-steel-surface p-5"
                >
                  <p className="text-2xl font-bold text-ink sm:text-3xl">{stat.value}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{stat.label}</p>
                </div>
              ))}
            </div>

            <p>
              만성 기침이 있으면 삶의 질 점수(EQ-5D-3L)가 0.86에서 0.79로
              낮아지고, 65세 이상 여성에서는 0.70에서 0.55로 차이가 더
              커집니다. (국민건강영양조사 2010~2016 재구성)
            </p>

            <p>
              LCQ, VAS 같은 설문은 주관적이라 실제 기침 빈도나 변화와 맞지
              않을 때가 있고, 24시간 녹음 장비는 오래 쓰기 어렵습니다. 일상에서
              반복해서 쓸 수 있는 객관적인 기록 도구가 필요한 이유입니다.
            </p>

            <p className="text-xs text-ink-soft">
              출처: 송우정·김상훈(2019), 대한내과학회지 / Kang J.Y. et
              al.(2020), Allergy Asthma Immunol Res / Kang J.Y. et
              al.(2019), Lung
            </p>
          </Section>

          <Section eyebrow="검증 결과" title="지금까지 확인한 것">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {RESULT_STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-gray-light/70 bg-steel-surface p-4 sm:p-5"
                >
                  <p className="text-xl font-bold text-ink sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs text-ink-soft sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>

            <p>
              기침 17,453건과 비기침 11,657건으로 기침 판별 모델을 학습했고,
              시험 데이터 2,911건으로 성능을 평가했습니다.
            </p>
            <p>
              <Em>
                이 수치는 기침과 기침이 아닌 소리를 얼마나 잘 구분하는지에
                대한 성능이며, 건강 상태를 판정하는 성능이 아닙니다.
              </Em>
            </p>
            <p>
              Android 프로토타입으로 기침 50건을 측정해 이탈도 계산, 단계
              표시, 기록 추적이 정상적으로 작동하는 것을 확인했습니다.
              임상적 유효성은 아직 검증하지 않았습니다.
            </p>
            <p>
              이 분석 방식(STFT→2D CNN→마할라노비스 거리)은
              한국산업기술융합학회 학술대회에서 발표해 우수상을 받았습니다.
            </p>
          </Section>

          <Section eyebrow="앞으로의 계획" title="앞으로 이렇게 발전시킵니다">
            <ul className="list-disc space-y-3 pl-5 marker:text-primary">
              <li>
                해외 데이터로 만든 기준이 국내 사용자와 다양한 녹음 환경에
                얼마나 맞는지 검증합니다.
              </li>
              <li>이 사이트를 통해 국내 기침 데이터를 모읍니다.</li>
              <li>
                사용자 본인의 평소 기침을 기준으로 하는 개인별 기준 분포를
                만듭니다.
              </li>
              <li>
                기기와 소음 조건을 바꿔 가며 반복 측정해, 결과가 안정적인지
                확인합니다.
              </li>
              <li>
                의료기관과 협업하게 되면, 건강 상태가 확인된 데이터로 기준과
                지표의 유용성을 검토하고, 측정 기록을 구조화된 보고서로
                제공하는 방향을 검토합니다.
              </li>
            </ul>
            <p className="text-sm text-ink-soft">
              어떤 기능도 의료적 판단을 대신하는 것으로 내세우지 않습니다.
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
              양호·주의·경고는 기준 분포와 비교한 소리의 차이이며, 질병의 유무나
              심한 정도를 뜻하지 않습니다. 현재 기준은 해외 공개 데이터로 만든
              것이라, 국내 사용자에게 얼마나 잘 맞는지는 검증 중입니다. 증상이
              계속되거나 심해진다면 반드시 의료기관에서 진료를 받으시기
              바랍니다.
            </p>
          </div>

          {/* 문의 + CTA */}
          <div className="mt-14 flex flex-col items-center gap-5 rounded-3xl border border-gray-light/70 bg-steel-surface px-6 py-12 text-center">
            <h2 className="text-xl font-bold text-ink sm:text-2xl">
              연구에 참여해 주시겠어요?
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-ink-soft sm:text-base">
              녹음에 참여하시면 국내 사용자에게 맞는 기준을 만드는 데 도움이
              됩니다. 첫 녹음 전에 연구 목적과 데이터 이용에 대한 동의 안내를
              한 번 더 보여드립니다.
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

type Stat = {
  value: string;
  label: string;
};

const BACKGROUND_STATS: readonly Stat[] = [
  { value: "3.48%", label: "40세 이상 만성 기침 유병률" },
  { value: "75%", label: "의료기관을 2곳 이상 방문" },
  { value: "27.1%", label: "의사가 충분히 다뤘다고 느낌" },
  { value: "70%", label: "이전 치료 효과가 제한적" },
] as const;

const RESULT_STATS: readonly Stat[] = [
  { value: "95.3%", label: "정확도" },
  { value: "94.1%", label: "정밀도" },
  { value: "98.2%", label: "재현율" },
  { value: "96.1%", label: "F1" },
  { value: "98.3%", label: "AUC" },
] as const;

type AnalysisStep = {
  title: string;
  description: string;
};

const ANALYSIS_STEPS: readonly AnalysisStep[] = [
  {
    title: "기침 소리 녹음",
    description:
      "조용한 곳에서 기침 소리를 녹음합니다. 주변 소음이 적을수록 분석이 정확해집니다.",
  },
  {
    title: "기침인지 확인",
    description:
      "녹음된 소리를 시간·주파수 그림(스펙트로그램)으로 바꾼 뒤, AI 모델(2D CNN)이 기침인지 먼저 판별합니다. 기침이 아니면 분석을 멈춥니다.",
  },
  {
    title: "소리를 숫자로 바꾸기",
    description:
      "기침으로 판별되면, 같은 AI 모델이 기침의 음향 특징을 여러 개의 숫자 묶음으로 뽑아냅니다.",
  },
  {
    title: "기준 패턴과 맞춰보기",
    description:
      "특별한 증상이 없는 사람들의 기침이 이루는 범위를 기준으로 삼습니다. 이 기준은 공개 데이터셋 COUGHVID에서 의료진이 건강한 기침으로 분류한 음원 705개, 기침 구간 1,354개로 만들었습니다.",
  },
  {
    title: "얼마나 벗어났는지 재기",
    description:
      "녹음한 기침이 그 범위에서 얼마나 떨어져 있는지 마할라노비스 거리로 계산해 0~100 백분위로 바꾸고, 50 미만은 양호, 50 이상 75 미만은 주의, 75 이상은 경고로 보여드립니다. 이 구간은 기준과 비교한 소리의 차이일 뿐, 질병의 유무나 심한 정도를 뜻하지 않습니다.",
  },
] as const;

const RECORDING_TIPS: readonly string[] = [
  "가능한 한 조용한 환경에서 녹음해 주세요.",
  "기침이 아닌 소리(말소리, 주변 소음)가 섞이면 분석이 중단되거나 신뢰도 점수가 낮게 나올 수 있습니다.",
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
