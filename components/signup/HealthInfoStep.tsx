"use client";

import {
  CheckboxGroupField,
  RadioGroupField,
  TextField,
  TextareaField,
} from "@/components/form/Fields";
import {
  RESPIRATORY_CONDITION_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  SYMPTOM_OPTIONS,
  YES_NO_OPTIONS,
  type SignupFormData,
} from "@/lib/signup";

type HealthInfoStepProps = {
  data: SignupFormData;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
  /** 입력하지 않고 바로 가입을 끝냅니다. */
  onSkip: () => void;
};

/** 4단계: 건강 정보 (전부 선택 입력) */
export default function HealthInfoStep({
  data,
  onChange,
  onSkip,
}: HealthInfoStepProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-ink sm:text-2xl">
        건강 정보
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        답해 주시면 분석이 더 정확해지지만, 지금 하지 않으셔도 됩니다. 나중에
        마이페이지에서 언제든 추가할 수 있습니다.
      </p>

      {/* 선택 입력이라는 걸 맨 위에서 바로 알리고 빠져나갈 길을 함께 둡니다 */}
      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-gray-light bg-steel-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-ink-soft">
          여기서부터는 전부 <span className="text-primary">선택 입력</span>이에요.
        </p>
        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 rounded-full border border-line bg-steel-surface px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
        >
          건너뛰고 가입 완료
        </button>
      </div>

      <div className="mt-6 space-y-6">
        <CheckboxGroupField
          label="현재 겪고 있는 증상"
          hint="해당하는 것을 모두 골라 주세요. 없으면 비워 두세요."
          values={data.symptoms}
          onChange={(values) => onChange("symptoms", values)}
          options={SYMPTOM_OPTIONS}
        />

        <RadioGroupField
          name="symptomDuration"
          label="증상이 이어진 기간"
          value={data.symptomDuration}
          onChange={(value) => onChange("symptomDuration", value)}
          options={SYMPTOM_DURATION_OPTIONS}
        />

        <CheckboxGroupField
          label="진단받은 적 있는 호흡기 질환"
          hint="해당하는 것을 모두 골라 주세요. 없으면 비워 두세요."
          values={data.respiratoryConditions}
          onChange={(values) => onChange("respiratoryConditions", values)}
          options={RESPIRATORY_CONDITION_OPTIONS}
        />

        <RadioGroupField
          name="recentInfection"
          label="최근 2주 내 감기·독감·코로나 등 호흡기 감염이 있었나요?"
          value={data.recentInfection}
          onChange={(value) => onChange("recentInfection", value)}
          options={YES_NO_OPTIONS}
        />

        <TextField
          id="medication"
          label="현재 복용 중인 약"
          value={data.medication}
          onChange={(value) => onChange("medication", value)}
          placeholder="예: 흡입기, 항히스타민제"
          hint="기침에 영향을 줄 수 있는 약이 있다면 적어 주세요."
        />

        <TextareaField
          id="note"
          label="추가로 알려주실 내용"
          value={data.note}
          onChange={(value) => onChange("note", value)}
          placeholder="분석에 참고가 될 만한 내용이 있다면 자유롭게 적어 주세요."
        />
      </div>

      <p className="mt-6 rounded-xl border border-gray-light bg-steel-surface p-4 text-xs leading-relaxed text-ink-soft sm:text-sm">
        입력하신 건강 정보는 기침 소리 분석의 배경 자료로만 사용되며, 진단이나
        의학적 판단에 쓰이지 않습니다.
      </p>
    </div>
  );
}
