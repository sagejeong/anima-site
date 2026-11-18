import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "계정 및 데이터 삭제 · ANiMA",
  description: "ANiMA 계정과 데이터를 삭제하는 방법을 안내합니다.",
};

export default function DeleteAccountPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            ANiMA 계정 및 데이터 삭제
          </h1>

          <p className="mt-8 text-pretty text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
            ANiMA는 로그인 계정이 있는 사용자와, 계정 없이 기기 식별자(UUID)만으로
            이용하는 사용자 두 종류가 있습니다. 본인에게 해당하는 방법으로 삭제를
            요청하실 수 있습니다.
          </p>

          <Section title="1. 아이디/비밀번호로 가입한 사용자">
            <p>
              웹사이트(animawith.cloud)에 로그인한 뒤{" "}
              <Link
                href="/settings"
                className="font-medium text-primary underline underline-offset-4"
              >
                설정
              </Link>
              에서 &ldquo;계정 탈퇴&rdquo;를 눌러 직접 삭제할 수 있습니다.
              비밀번호 확인 후 즉시 처리되며, 탈퇴하면 계정과 지금까지의 기록이
              함께 삭제됩니다.
            </p>
          </Section>

          <Section title="2. 계정 없이 이용하는 사용자">
            <p>
              로그인 계정이 없는 경우, 기기에 저장된 임의 식별자(UUID)로 본인
              확인을 합니다.
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>
                웹에서 이용 중이라면:{" "}
                <Link
                  href="/settings"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  설정
                </Link>{" "}
                화면에서 내 UUID를 확인하고 복사할 수 있습니다.
              </li>
              <li>앱에서 이용 중이라면: 설정 &gt; 내 정보 &gt; 내 UUID에서 확인할 수 있습니다.</li>
            </ul>
            <p>
              UUID를 복사한 뒤, 아래 이메일로 &ldquo;데이터 삭제 요청&rdquo;이라는
              제목과 함께 UUID를 보내주세요. UUID는 사용자를 실명으로 특정하지
              않는 임의 식별자이며, 본인 확인을 위해 꼭 필요합니다.
            </p>
          </Section>

          <Section title="삭제되는 데이터">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>분석 결과(이탈도 등 측정 기록)</li>
              <li>(계정 사용자) 아이디, 복구용 이메일, 비밀번호</li>
            </ul>
          </Section>

          <Section title="저장하지 않는 데이터">
            <p>녹음 음성 파일 — 분석 직후 폐기되며 서버에 저장되지 않습니다.</p>
          </Section>

          <Section title="처리 기간">
            <ul className="list-disc space-y-2 pl-5 marker:text-primary">
              <li>
                삭제(탈퇴) 즉시: 서버 데이터는 즉시 삭제되며, 백업 데이터는 최대
                30일 이내 완전히 삭제됩니다.
              </li>
              <li>이메일 삭제 요청: 요청일로부터 10일 이내 처리됩니다.</li>
            </ul>
          </Section>

          <Section title="보관 기간">
            <p>탈퇴 또는 삭제를 요청하시기 전까지 보관합니다.</p>
          </Section>

          <Section title="문의처">
            <p>
              개인정보 관련 문의:{" "}
              <a
                href="mailto:anima.with@gmail.com"
                className="font-medium text-primary underline underline-offset-4"
              >
                anima.with@gmail.com
              </a>
            </p>
            <p>
              삭제 외 다른 개인정보 문의는{" "}
              <Link
                href="/privacy"
                className="font-medium text-primary underline underline-offset-4"
              >
                개인정보처리방침
              </Link>
              을 참고해 주세요.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 first:mt-10">
      <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-soft sm:text-lg sm:leading-relaxed">
        {children}
      </div>
    </section>
  );
}
