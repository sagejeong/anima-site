"use client";

import { useState } from "react";
import {
  CheckboxGroupField,
  TextField,
  TextareaField,
} from "@/components/form/Fields";
import {
  RESPIRATORY_CONDITION_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  SYMPTOM_OPTIONS,
  YES_NO_OPTIONS,
  type Option,
  type SignupFormData,
} from "@/lib/signup";

type HealthInfoStepProps = {
  data: SignupFormData;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
  /** 질문을 다 넘기거나 건너뛰면 호출 (바깥 SignupFlow의 submit) */
  onComplete: () => void;
  /** 첫 질문에서 "이전"을 누르면 호출 (바깥 SignupFlow의 goPrev) */
  onBack: () => void;
};

const MICRO_STEPS = [
  "symptoms",
  "symptomDuration",
  "respiratoryConditions",
  "recentInfection",
  "medication",
  "note",
] as const;

const ADVANCE_DELAY_MS = 350;

/** 4단계: 건강 정보. 전부 선택 입력이고, 기본 정보처럼 질문 하나씩 보여줌 */
export default function HealthInfoStep({
  data,
  onChange,
  onComplete,
  onBack,
}: HealthInfoStepProps) {
  const [index, setIndex] = useState(0);
  const current = MICRO_STEPS[index];

  const goNext = (): void => {
    if (index === MICRO_STEPS.length - 1) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goPrev = (): void => {
    if (index === 0) {
      onBack();
      return;
    }
    setIndex((i) => i - 1);
  };

  const choose = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ): void => {
    onChange(field, value);
    window.setTimeout(goNext, ADVANCE_DELAY_MS);
  };

  return (
    <div>
      {/* 선택 입력이라는 걸 맨 위에서 바로 알리고, 언제든 빠져나갈 길을 같이 둠 */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-light bg-steel-surface p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <p className="text-sm font-medium text-ink-soft">
          여기서부터는 전부 <span className="text-primary">선택 입력</span>이에요.
        </p>
        <button
          type="button"
          onClick={onComplete}
          className="shrink-0 rounded-full border border-line bg-steel-surface px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
        >
          건너뛰고 가입 완료
        </button>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={goPrev}
          className="shrink-0 text-sm font-medium text-ink-soft hover:text-ink"
        >
          ← 이전
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-light">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((index + 1) / MICRO_STEPS.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-ink-soft">
          {index + 1}/{MICRO_STEPS.length}
        </span>
      </div>

      {current === "symptoms" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            현재 겪고 있는 증상을 선택해주세요.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            해당하는 것을 모두 골라 주세요. 없으면 그냥 다음으로 넘어가세요.
          </p>
          <div className="mt-6">
            <CheckboxGroupField
              label=""
              values={data.symptoms}
              onChange={(values) => onChange("symptoms", values)}
              options={SYMPTOM_OPTIONS}
            />
          </div>
          <NextButton onClick={goNext} />
        </div>
      )}

      {current === "symptomDuration" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            증상이 이어진 기간을 선택해주세요.
          </h2>
          <BigChoiceList
            options={SYMPTOM_DURATION_OPTIONS}
            value={data.symptomDuration}
            onSelect={(value) => choose("symptomDuration", value)}
          />
        </div>
      )}

      {current === "respiratoryConditions" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            진단받은 적 있는 호흡기 질환을 선택해주세요.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            해당하는 것을 모두 골라 주세요. 없으면 그냥 다음으로 넘어가세요.
          </p>
          <div className="mt-6">
            <CheckboxGroupField
              label=""
              values={data.respiratoryConditions}
              onChange={(values) => onChange("respiratoryConditions", values)}
              options={RESPIRATORY_CONDITION_OPTIONS}
            />
          </div>
          <NextButton onClick={goNext} />
        </div>
      )}

      {current === "recentInfection" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            최근 2주 내 감기·독감·코로나 등 호흡기 감염이 있었는지 선택해주세요.
          </h2>
          <BigChoiceList
            options={YES_NO_OPTIONS}
            value={data.recentInfection}
            onSelect={(value) => choose("recentInfection", value)}
          />
        </div>
      )}

      {current === "medication" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            현재 복용 중인 약을 입력해주세요.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            기침에 영향을 줄 수 있는 약이 있다면 적어 주세요. 없으면 비워 두셔도 돼요.
          </p>
          <div className="mt-6">
            <TextField
              id="medication"
              label="복용 중인 약"
              value={data.medication}
              onChange={(value) => onChange("medication", value)}
              placeholder="예: 흡입기, 항히스타민제"
            />
          </div>
          <NextButton onClick={goNext} />
        </div>
      )}

      {current === "note" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            추가로 알려주실 내용을 입력해주세요.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            분석에 참고가 될 만한 내용이 있다면 자유롭게 적어 주세요.
          </p>
          <div className="mt-6">
            <TextareaField
              id="note"
              label="추가 내용"
              value={data.note}
              onChange={(value) => onChange("note", value)}
              placeholder="자유롭게 적어 주세요."
            />
          </div>
          <p className="mt-5 rounded-xl border border-gray-light bg-steel-surface p-4 text-xs leading-relaxed text-ink-soft sm:text-sm">
            입력하신 건강 정보는 기침 소리 분석의 배경 자료로만 사용되며, 진단이나
            의학적 판단에 쓰이지 않습니다.
          </p>
          <NextButton label="가입 완료" onClick={goNext} />
        </div>
      )}
    </div>
  );
}

function NextButton({
  label = "다음",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent"
    >
      {label}
    </button>
  );
}

function BigChoiceList({
  options,
  value,
  onSelect,
}: {
  options: readonly Option[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="mt-8 flex flex-col gap-3">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`w-full rounded-2xl border-2 px-5 py-4 text-left text-base font-semibold transition-colors ${
              selected
                ? "border-primary bg-primary/5 text-primary"
                : "border-gray-light text-ink hover:border-primary/40"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

