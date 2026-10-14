import type { Metadata } from "next";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";

export const metadata: Metadata = {
  title: "ANiMA 소개 · 기침 소리로 읽는 호흡 건강",
  description:
    "ANiMA는 기침 소리를 녹음해 건강한 사람들의 기침과 얼마나 다른지 알려주는 자가 모니터링 연구 프로젝트입니다. 의료적 진단은 제공하지 않습니다.",
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
              <span className="block">기침, 그냥</span>
              <span className="block">넘기고 계셨나요?</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
              스마트폰에 기침 소리를 녹음하면 ANiMA가 그 소리를 듣고, 건강한
              사람들의 기침과 얼마나 다른지 알려드려요. 병명을 알려주진
              않아요. 대신 기록이 하나둘 쌓이니까, &ldquo;요즘 기침이 좀
              달라졌나?&rdquo; 싶을 때 꺼내 보면 돼요.
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
              진료 때 증상을 설명하는 방법이 주로 기억이나 설문이다 보니,
              몇 주에서 몇 달에 걸친 변화를 꾸준히 기록하고 전달하기도
              쉽지 않습니다.
            </p>
            <p>
              ANiMA는 스마트폰으로 기침 소리를 녹음하고, 음향을 분석해 기침
              패턴이 어떻게 변하는지를 숫자와 기록으로 남깁니다. 목적은{" "}
              <Em>질병 진단이 아니라 꾸준한 자가 모니터링</Em>입니다. 본인이
              상태 변화를 알아차리고, 진료 때 의료진에게 보여줄 객관적인
              기록을 쌓도록 돕습니다.
            </p>
          </Section>

          <Section eyebrow="왜 필요한가" title="만성 기침, 숫자로 보면">
            <p>
              국내 연구에서 확인된 만성 기침의 영향은 이렇습니다.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
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

            <div className="mt-3 rounded-2xl border border-gray-light/70 bg-steel-surface p-5">
              <p className="text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
                삶의 질 점수(EQ-5D-3L)도 만성 기침이 없을 때 0.86, 있을 때
                0.79로 낮아지고, 65세 이상 여성에서는 0.70과 0.55로 차이가 더
                큽니다.
              </p>
            </div>

            <p className="mt-6">
              지금 쓰이는 도구에도 한계가 있습니다. LCQ나 VAS 같은 설문은
              주관적이라 실제 기침 빈도나 변화와 맞지 않을 때가 있고, 24시간
              녹음 장비는 일상에서 오래 쓰기 어렵습니다. 그래서 일상에서
              반복해서 쓸 수 있는 객관적인 추적 도구가 필요합니다.
            </p>

            <p className="text-xs text-ink-soft">
              출처: 송우정, 김상훈(2019) 대한내과학회지 / Kang J.Y. et
              al.(2020) Allergy Asthma Immunol Res / Kang J.Y. et al.(2019)
              Lung
            </p>
          </Section>

          <Section eyebrow="어떻게 분석하나" title="녹음 한 번이 숫자가 되기까지">
            <p>
              녹음 버튼을 누른 뒤 결과가 나오기까지, 안에서는 이런 단계가
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

            {/* 신뢰도 점수 */}
            <div className="mt-6 rounded-2xl border border-gray-light/70 bg-steel-surface p-5 sm:p-6">
              <h3 className="text-base font-semibold text-ink sm:text-lg">
                신뢰도 점수는 따로 보여드려요
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
                기침 판별 확신도 70%와 녹음 품질 30%를 합쳐, 이번 녹음을 얼마나
                믿을 수 있는지 보여드립니다. 이 점수는 이탈도와는 별개예요.
                70대 30 가중치는 팀이 정한 초기값이고, 데이터와 전문가 검토를
                거쳐 보완할 예정입니다.
              </p>
            </div>
          </Section>

          <Section eyebrow="기준 데이터" title="지금 쓰는 기준 패턴은 이렇게 만들었습니다">
            <p>
              현재 기준 분포는 해외 공개 데이터셋 COUGHVID에서 의료진이
              healthy_cough로 라벨링한 음원 705개를 쓰고, 여기서 잘라낸 기침
              구간 1,354개로 만들었습니다.
            </p>
            <p>
              양호·주의·경고 단계를 나누는 경계는 이 기준 분포의 50번째와
              75번째 백분위입니다. 마할라노비스 거리로는 각각 약 5.51, 6.70에
              해당합니다.
            </p>
            <p>
              지금은 모든 사용자를 같은 공통 분포와 비교합니다. 개인마다 따로
              기준을 만드는 기능은 준비 중입니다.
            </p>
          </Section>

          <Section
            eyebrow="왜 한국인 데이터가 필요한가"
            title="공통 기준이 모두에게 맞는지는 검증이 필요합니다"
          >
            <p>
              현재 쓰는 기준 분포는 해외 공개 데이터셋으로 만들었습니다. 이
              공통 분포가 국내 사용자와 다양한 녹음 환경에 얼마나 잘 맞는지는
              아직 검증이 더 필요합니다.
            </p>
            <p>
              이런 차이를 의식해서, 기침 여부를 가려내는 모델을 학습할 때
              쓰는 비기침 데이터는 해외 공개 데이터 대신 팀원들이 대중교통,
              집, 실외에서 직접 녹음한 국내 생활 소음을 썼습니다. 해외
              데이터만으로는 담기 어려운 실제 사용 환경의 소음을 반영하려는
              목적입니다.
            </p>
            <p>
              같은 이유로, ANiMA는 이 사이트를 통해 국내 기침 데이터를 직접
              모으고 공통 기준의 적합성을 검증하는 것을 다음 목표로 두고
              있습니다.
            </p>
          </Section>

          <Section eyebrow="지금까지의 결과" title="모델 성능과 실사용 테스트">
            <h3 className="text-base font-semibold text-ink sm:text-lg">기침 감지 모델</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary">
              <li>
                학습 데이터는 기침 17,453건, 비기침 11,657건입니다. 학습
                80%, 검증 10%, 시험 10%로 나눴습니다.
              </li>
              <li>
                시험 데이터 2,911건 결과: 정확도 95.3%, 정밀도 94.1%, 재현율
                98.2%, F1 96.1%, AUC 98.3%
              </li>
              <li>
                기침을 비기침으로 잘못 본 경우는 31건, 비기침을 기침으로
                잘못 본 경우는 106건입니다.
              </li>
            </ul>
            <p className="rounded-xl bg-primary/5 p-4 text-sm font-medium text-ink">
              이 수치는 기침과 비기침을 얼마나 잘 구분하는지에 대한
              성능입니다. 건강 상태를 판정하는 성능이 아닙니다.
            </p>

            <h3 className="mt-8 text-base font-semibold text-ink sm:text-lg">실사용 테스트</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-primary">
              <li>
                Android 프로토타입으로 기침 50건을 측정해 이탈도 계산, 단계
                표시, 이력 추적이 실제로 동작하는 것을 확인했습니다.
              </li>
              <li>
                임상적 유효성은 아직 검증하지 않았고, 앞으로의 과제입니다.
              </li>
              <li>
                STFT, 2D CNN, 마할라노비스 거리로 이어지는 분석 파이프라인을
                한국산업기술융합학회 학술대회에서 발표했고, 우수상을
                받았습니다.
              </li>
            </ul>
          </Section>

          <Section eyebrow="앞으로의 계획" title="다음 단계">
            <ul className="list-disc space-y-3 pl-5 marker:text-primary">
              <li>
                <Em>검증</Em>: 해외 공개 데이터로 만든 공통 분포가 국내
                사용자와 여러 녹음 조건에 얼마나 맞는지 추가로 검증합니다.
              </li>
              <li>
                <Em>국내 데이터 확보</Em>: 이 사이트를 통해 참여자의 기침
                데이터를 모읍니다. 국내 기침 데이터와 생활 소음 데이터가
                쌓이면, 녹음 환경이나 사용자 특성이 다른 조건에서 모델을
                평가하고 개선할 수 있습니다.
              </li>
              <li>
                <Em>개인별 기준 분포</Em>: 사용자 본인의 평소 기침을 기준으로
                변화를 보여주는 방식으로 발전시킵니다.
              </li>
              <li>
                <Em>반복 측정 검증</Em>: 기기와 소음 조건을 바꿔 가며 반복
                측정해 결과가 안정적인지 확인합니다.
              </li>
              <li>
                <Em>의료기관 협업 시</Em>: 건강 상태가 확인된 데이터로 기준
                분포와 변화 지표가 쓸모 있는지 검토합니다. 측정 이력을
                구조화된 보고서로 제공하는 방향과, 치료 전후 변화 비교 같은
                항목의 유용성도 의료진과 함께 봅니다.
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
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft marker:text-primary sm:text-base sm:leading-relaxed">
              <li>
                ANiMA는 의료적 진단을 하지 않습니다. 기준 패턴과의 차이를
                보여주는 참고 기록입니다.
              </li>
              <li>
                양호·주의·경고는 질병 유무나 중증도가 아니라, 기준 분포와
                비교한 소리의 차이입니다.
              </li>
              <li>
                현재 기준은 해외 공개 데이터로 만든 공통 분포라서, 국내
                사용자에게 얼마나 맞는지는 검증 중입니다.
              </li>
              <li>증상이 계속되거나 심해지면 의료기관을 방문해 주세요.</li>
            </ul>
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
  { value: "75%", label: "만성 기침 환자 중 의료기관을 2곳 이상 방문한 비율" },
  { value: "27.1%", label: "의사가 자신의 기침을 충분히 다뤘다고 느낀 비율" },
  { value: "70%", label: "이전 치료의 효과가 제한적이었다고 응답한 비율" },
] as const;

type AnalysisStep = {
  title: string;
  description: string;
};

const ANALYSIS_STEPS: readonly AnalysisStep[] = [
  {
    title: "녹음",
    description:
      "스마트폰으로 기침 소리를 녹음합니다. 조용한 곳에서, 기기를 얼굴에서 약 20cm 떨어뜨려 주세요.",
  },
  {
    title: "기침인지 확인",
    description:
      "AI 모델이 녹음된 소리가 기침인지 먼저 판별합니다. 기침이 아니라고 판단되면 분석을 거기서 멈춥니다. 소리를 시간·주파수 그림(스펙트로그램)으로 바꾼 뒤, 이미지 분석 모델(2D CNN)이 기침 여부를 판단합니다. 비기침 학습 데이터로는 팀원들이 대중교통, 집, 실외에서 직접 녹음한 국내 생활 소음을 썼습니다.",
  },
  {
    title: "특징 추출",
    description:
      "기침으로 판별되면, 같은 2D CNN이 스펙트로그램에서 기침의 음향 특징을 숫자 묶음으로 뽑아냅니다.",
  },
  {
    title: "기준과 비교",
    description:
      "뽑아낸 특징이 증상이 없는 사람들의 기침으로 만든 기준 분포에서 얼마나 떨어져 있는지(이탈도)를 마할라노비스 거리로 계산합니다.",
  },
  {
    title: "결과 표시",
    description:
      "이탈도를 0~100 백분위로 바꿔 세 단계로 보여줍니다. 50 미만 양호, 50 이상 75 미만 주의, 75 이상 경고. 이 단계는 기준 분포와 비교한 소리의 차이일 뿐, 질병 유무나 중증도를 뜻하지 않습니다. 경계값(50, 75)은 백분위 기준 초기값이고 앞으로 검증해서 보완합니다.",
  },
  {
    title: "기록",
    description: "측정할 때마다 결과가 쌓여서 시간에 따른 변화를 볼 수 있습니다.",
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
