"use client";

import { CheckboxGroupField, TextField } from "@/components/form/Fields";
import type { Option } from "@/lib/signup";

export const MEDICATION_CATEGORY_OPTIONS: readonly Option[] = [
  { value: "cough_syrup", label: "기침약·거담제" },
  { value: "antihistamine", label: "항히스타민제(알레르기약)" },
  { value: "cold_medicine", label: "감기약·해열진통제" },
  { value: "inhaler", label: "천식 흡입기" },
  { value: "antibiotics", label: "항생제" },
] as const;

type MedicationCategoryStepProps = {
  values: string[];
  onValuesChange: (values: string[]) => void;
  other: string;
  onOtherChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting: boolean;
};

/**
 * "복용 중인 약이 있나요?"에서 "예"를 골랐을 때만 나오는 다음 화면.
 * MRRecord의 medication_category/medication_name 컬럼에 대응합니다.
 */
export default function MedicationCategoryStep({
  values,
  onValuesChange,
  other,
  onOtherChange,
  onConfirm,
  onBack,
  isSubmitting,
}: MedicationCategoryStepProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <h2 className="text-lg font-bold text-ink">
        어떤 약을 복용 중인가요?
      </h2>

      <div className="mt-6 space-y-5">
        <CheckboxGroupField
          label="해당하는 것을 모두 골라 주세요"
          values={values}
          onChange={onValuesChange}
          options={MEDICATION_CATEGORY_OPTIONS}
        />

        <TextField
          id="medicationOther"
          label="기타 (선택)"
          value={other}
          onChange={onOtherChange}
          placeholder="목록에 없는 약이 있다면 적어 주세요"
        />
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft transition-colors hover:border-line disabled:opacity-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60"
        >
          {isSubmitting ? "분석 요청하는 중..." : "확인하고 분석하기"}
        </button>
      </div>
    </div>
  );
}
