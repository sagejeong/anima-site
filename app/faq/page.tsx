import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "자주 묻는 질문 — ANiMA",
  description: "ANiMA 이용에 대해 자주 나오는 질문과 답변입니다.",
};

// TODO: 예시로 먼저 채워둔 문항입니다. 실제 문의 내용이 쌓이면 그걸로 교체해 주세요.
type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: readonly FaqItem[] = [
  {
    question: "ANiMA는 병을 진단해 주나요?",
    answer:
      "아니요. ANiMA는 의료기기가 아니라 개인 참고용 음향 분석 도구입니다. 녹음한 기침이 기준 패턴과 얼마나 다른지 보여드릴 뿐, 의료적 진단은 하지 않습니다. 증상이 계속되거나 심해지면 의료기관에서 진료를 받아 주세요.",
  },
  {
    question: "회원가입을 꼭 해야 하나요?",
    answer:
      "아니요. 계정 없이도 바로 녹음하고 결과를 확인할 수 있습니다. 다른 기기에서도 기록을 이어보고 싶을 때만 아이디를 만들면 됩니다.",
  },
  {
    question: "녹음한 기침 소리는 어떻게 쓰이나요?",
    answer:
      "분석을 요청하지 않으면 녹음 파일은 이 브라우저 밖으로 나가지 않습니다. 분석을 요청하면 연구·개발 목적으로만 사용되며, 이름이나 연락처 같은 인적사항은 저장되지 않습니다.",
  },
  {
    question: "결과 화면의 퍼센트는 무슨 뜻인가요?",
    answer:
      "여러 사람의 기침 데이터로 만든 기준 패턴과 내 기침이 얼마나 다른지를 0~100%로 나타낸 값입니다. 숫자가 낮을수록 기준 패턴과 차이가 적다는 뜻이에요. 자세한 계산 방법은 소개 페이지에서 볼 수 있습니다.",
  },
  {
    question: "브라우저를 바꾸면 기록이 사라지나요?",
    answer:
      "계정을 만들지 않았다면 그럴 수 있습니다. 기록은 브라우저 단위로 저장되기 때문에, 다른 브라우저나 시크릿 모드에서는 이전 기록이 보이지 않습니다. 아이디를 만들어 두면 로그인으로 이어볼 수 있습니다.",
  },
  {
    question: "녹음이 잘 안 돼요.",
    answer:
      "조용한 곳에서 기기를 얼굴에서 약 20cm 떨어뜨리고, 3초 이상 녹음해 주세요. 마이크 권한을 허용하지 않았다면 주소창의 자물쇠 아이콘에서 권한을 바꿀 수 있습니다.",
  },
];

export default function FaqPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            자주 묻는 질문
          </h1>

          <dl className="mt-12 flex flex-col gap-3">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.question}
                className="rounded-2xl border border-gray-light bg-white p-5 sm:p-6"
              >
                <dt className="text-base font-semibold text-neutral-900 sm:text-lg">
                  Q. {item.question}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base sm:leading-relaxed">
                  {item.answer}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-center text-sm text-neutral-500">
            더 궁금한 점이 있으면{" "}
            <a
              href="mailto:anima.with@gmail.com"
              className="font-medium text-primary underline underline-offset-4"
            >
              anima.with@gmail.com
            </a>
            으로 문의해 주세요.
          </p>
        </div>
      </main>
    </div>
  );
}
