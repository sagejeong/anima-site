"use client";

type ConsentStepProps = {
  agreed: boolean;
  onAgreedChange: (agreed: boolean) => void;
  error?: string;
};

/** 1단계: 연구 참여 동의 안내 */
export default function ConsentStep({
  agreed,
  onAgreedChange,
  error,
}: ConsentStepProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
        연구 참여 안내 및 동의
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        아래 내용을 읽고 동의해 주셔야 가입을 진행할 수 있습니다.
      </p>

      {/* TODO: 문구 검수 필요 — 최종 동의문 확정 시 이 영역만 교체 */}
      <div className="mt-6 max-h-96 space-y-5 overflow-y-auto rounded-2xl border border-gray-light bg-neutral-50 p-5 text-sm leading-relaxed text-neutral-700 sm:p-6 sm:text-base sm:leading-relaxed">
        <section>
          <h3 className="font-semibold text-neutral-900">연구 목적</h3>
          <p className="mt-2">
            본 연구는 사람의 목소리를 통해 호흡기 상태를 분석하는 데 높은
            민감도를 보인 기존 연구들을 기반으로 합니다. ANiMA는 의료기기가
            아니며, 기침 패턴을 더 정교하게 비교하는 통계적 도구는 추후 이
            앱에 통합될 예정입니다.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-900">참여와 개인정보</h3>
          <p className="mt-2">
            연구 참여는 전적으로 자발적이며, 분석을 요청하지 않으시면 개인 식별
            정보가 포함되지 않습니다. 분석을 요청하셔도 가입 시 ID 정도의 정보만
            식별 번호로 사용되며, 사용자를 특정할 수 있는 인적사항은 저장되지
            않습니다.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-900">녹음 절차 안내</h3>
          <p className="mt-2">
            전체 녹음 및 데이터 수집은 약 5분 정도 소요됩니다. 녹음 중에는 기기를
            얼굴에서 약 20cm 정도 떨어뜨려 주시고, 조용한 환경에서 녹음해
            주십시오. 녹음 기기는 세척·소독 전에는 다른 사람과 공유하지
            마십시오.
          </p>
          <p className="mt-2">
            ANiMA 프로젝트(한국폴리텍대학 인천캠퍼스 AI융합소프트웨어과)는
            비침습적 기록 절차로 본 연구를 진행합니다.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-neutral-900">데이터 이용 범위</h3>
          <p className="mt-2">
            동의하시면 귀하의 데이터를 연구·개발 목적으로만 사용할 수 있도록
            허락하는 것이며, 당사의 이용약관에 동의하는 것입니다.
          </p>
          <p className="mt-2">
            문의사항이 있으시면{" "}
            <a
              href="mailto:anima.with@gmail.com"
              className="font-medium text-primary underline underline-offset-4"
            >
              anima.with@gmail.com
            </a>
            로 연락 주시기 바랍니다.
          </p>
        </section>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-gray-light p-4 transition-colors hover:border-primary/50 has-checked:border-primary has-checked:bg-primary/5">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => onAgreedChange(event.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
        />
        <span className="text-sm leading-relaxed text-neutral-800 sm:text-base">
          <span className="font-semibold text-primary">[필수]</span> 위 내용을
          모두 읽었으며, 연구·개발 목적의 데이터 이용에 동의합니다.
        </span>
      </label>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
