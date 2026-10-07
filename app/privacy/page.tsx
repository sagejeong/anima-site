import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "개인정보처리방침 · ANiMA",
  description: "ANiMA가 수집하는 정보와 그 이용 목적을 안내합니다.",
};

type CollectedItem = {
  item: string;
  purpose: string;
  method: string;
};

const COLLECTED_ITEMS: readonly CollectedItem[] = [
  {
    item: "녹음 음성(기침 소리)",
    purpose: "기침 여부 판별 및 건강 상태 분석(이탈도 계산)",
    method: "사용자가 녹음 버튼을 눌렀을 때만 수집",
  },
  {
    item: "위치 정보(대략적 위치)",
    purpose: "분석 결과에 참고용으로 날씨·대기질 정보를 함께 제공하기 위함",
    method: "기기 위치 권한 허용 시에만 수집",
  },
  {
    item: "기기 내 임의 생성 식별자(UUID)",
    purpose: "로그인 없이 사용자별 분석 기록을 구분하기 위함 (실명, 전화번호 등 개인 식별 정보 아님)",
    method: "앱 최초 실행 시 자동 생성, 기기 내부에 저장",
  },
  {
    item: "복약 여부, 통증·증상 체감 점수",
    purpose: "분석 리포트에 사용자 입력 맥락을 함께 기록하기 위함",
    method: "사용자가 직접 입력한 경우에만 수집",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            ANiMA 개인정보처리방침
          </h1>
          <p className="mt-3 text-sm text-ink-soft">최종 수정일: 2026년 10월 7일</p>

          <p className="mt-8 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
            ANiMA(이하 &ldquo;앱&rdquo;)는 사용자의 기침 소리를 녹음·분석하여 건강 관리에
            도움이 되는 정보를 제공하는 서비스입니다. 본 방침은 앱이 수집하는 정보와 그
            이용 목적을 안내합니다.
          </p>

          <Section number={1} title="수집하는 정보">
            <div className="overflow-x-auto rounded-2xl border border-gray-light">
              <table className="w-full min-w-[560px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-light bg-steel-surface text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
                    <th className="px-4 py-3">항목</th>
                    <th className="px-4 py-3">수집 목적</th>
                    <th className="px-4 py-3">수집 방식</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-light">
                  {COLLECTED_ITEMS.map((row) => (
                    <tr key={row.item} className="bg-steel-surface">
                      <td className="px-4 py-3.5 font-semibold text-ink">{row.item}</td>
                      <td className="px-4 py-3.5 leading-relaxed text-ink-soft">{row.purpose}</td>
                      <td className="px-4 py-3.5 leading-relaxed text-ink-soft">{row.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 leading-relaxed">
              앱은 이름, 전화번호, 이메일 등 사용자를 직접 식별할 수 있는 정보를 수집하지
              않습니다.
            </p>
          </Section>

          <Section number={2} title="정보의 저장 및 처리">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>녹음 음성과 분석 결과는 우선 사용자 기기 내부(로컬 저장소)에 저장됩니다.</li>
              <li>
                분석을 위해 녹음 음성이 ANiMA 자체 분석 서버로 전송되며, 서버는 음성을
                분석해 결과만 기기로 반환합니다.
              </li>
              <li>서버로 전송된 음성 파일은 분석 목적 외에 다른 용도로 사용되지 않습니다.</li>
            </ul>
          </Section>

          <Section number={3} title="제3자 제공">
            <p>
              수집된 정보는 ANiMA 자체 분석 서버 외의 제3자에게 제공되거나 판매되지
              않습니다.
            </p>
          </Section>

          <Section number={4} title="광고">
            <p>본 앱은 광고를 포함하지 않습니다.</p>
          </Section>

          <Section number={5} title="정보 보관 및 삭제">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>분석 기록은 사용자가 앱을 삭제하면 기기 내 저장된 데이터와 함께 삭제됩니다.</li>
              <li>
                서버에 전송된 음성 파일의 삭제를 원하실 경우 아래 문의처로 요청하실 수
                있습니다.
              </li>
            </ul>
          </Section>

          <Section number={6} title="문의처">
            <p>
              개인정보 관련 문의:{" "}
              <a
                href="mailto:anima.with@gmail.com"
                className="font-medium text-primary underline underline-offset-4"
              >
                anima.with@gmail.com
              </a>
            </p>
          </Section>

          <Section number={7} title="방침의 변경">
            <p>본 방침은 서비스 개선에 따라 변경될 수 있으며, 변경 시 본 페이지를 통해 공지합니다.</p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-10">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {number}. {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
