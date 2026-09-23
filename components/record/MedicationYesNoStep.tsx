"use client";

type MedicationYesNoStepProps = {
  onYes: () => void;
  onNo: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

/**
 * 복용 약 확인의 첫 단계. 여기서 "아니오"를 고르면 바로 분석 요청으로
 * 넘어가고, "예"를 고를 때만 다음 화면(MedicationCategoryStep)에서
 * 구체적으로 어떤 약인지 고릅니다.
 */
export default function MedicationYesNoStep({
  onYes,
  onNo,
  onBack,
  isSubmitting,
}: MedicationYesNoStepProps) {
  return (
    <div className="mx-auto w-full max-w-md text-center">
      <h2 className="text-xl font-bold text-ink">
        복용 중인 약이 있나요?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        일부 약은 기침 소리에 영향을 줄 수 있어요.
      </p>

      <div className="mt-8 flex justify-center gap-3">
        <button
          type="button"
          onClick={onNo}
          disabled={isSubmitting}
          className="w-28 rounded-full border border-line px-6 py-3 text-base font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
        >
          아니오
        </button>
        <button
          type="button"
          onClick={onYes}
          disabled={isSubmitting}
          className="w-28 rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60"
        >
          예
        </button>
      </div>

      {isSubmitting && (
        <p className="mt-4 text-sm text-ink-soft">분석 요청하는 중...</p>
      )}

      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="mt-8 text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-primary disabled:opacity-60"
      >
        이전
      </button>
    </div>
  );
}
