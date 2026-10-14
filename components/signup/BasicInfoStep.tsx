"use client";

import { useState } from "react";
import { SelectField, TextField } from "@/components/form/Fields";
import {
  COUNTRY_OPTIONS,
  GENDER_OPTIONS,
  HAS_OPTIONS,
  KOREA_REGION_OPTIONS,
  LIVING_ENVIRONMENT_OPTIONS,
  SMOKING_OPTIONS,
  VISIT_PURPOSE_OPTIONS,
  YES_NO_OPTIONS,
  type FormErrors,
  type Option,
  type SignupFormData,
} from "@/lib/signup";

type BasicInfoStepProps = {
  data: SignupFormData;
  errors: FormErrors;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
  /** 마지막 질문까지 답하면 호출 (바깥 SignupFlow의 goNext) */
  onComplete: () => void;
  /** 첫 질문에서 "이전"을 누르면 호출 (바깥 SignupFlow의 goPrev) */
  onBack: () => void;
};

const MICRO_STEPS = [
  "age",
  "gender",
  "location",
  "smoking",
  "allergy",
  "dustExposure",
  "hasPet",
  "livingEnvironment",
  "firstVisit",
  "visitPurpose",
] as const;

// 선택하면 바로 넘어가되, 뭘 골랐는지 한 박자 보여주고 넘어감
const ADVANCE_DELAY_MS = 350;

/** 3단계: 기본 정보. PASS·토스처럼 질문 하나씩 보여주고 고르면 바로 다음으로 넘어감 */
export default function BasicInfoStep({
  data,
  errors,
  onChange,
  onComplete,
  onBack,
}: BasicInfoStepProps) {
  const [index, setIndex] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const current = MICRO_STEPS[index];
  const isKorea = data.country === "kr";

  const goNext = (): void => {
    setLocalError(null);
    if (index === MICRO_STEPS.length - 1) {
      onComplete();
      return;
    }
    setIndex((i) => i + 1);
  };

  const goPrev = (): void => {
    setLocalError(null);
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

  const handleAgeNext = (): void => {
    const age = Number(data.age);
    if (data.age === "" || Number.isNaN(age) || age < 1 || age > 120) {
      setLocalError("1~120 사이의 숫자로 입력해 주세요.");
      return;
    }
    goNext();
  };

  const handleLocationNext = (): void => {
    if (data.country === "") {
      setLocalError("국가를 선택해 주세요.");
      return;
    }
    if (data.region === "") {
      setLocalError("지역을 입력해 주세요.");
      return;
    }
    goNext();
  };

  return (
    <div>
      <div className="flex items-center gap-3">
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

      {current === "age" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">나이가 어떻게 되세요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            나이에 따라 기침 패턴이 다르게 나타나요.
          </p>
          <div className="mt-6">
            <TextField
              id="age"
              label="나이"
              type="number"
              min={1}
              max={120}
              value={data.age}
              onChange={(value) => onChange("age", value)}
              placeholder="25"
              error={localError ?? errors.age}
            />
          </div>
          <NextButton onClick={handleAgeNext} />
        </div>
      )}

      {current === "gender" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">성별이 어떻게 되세요?</h2>
          <BigChoiceList
            options={GENDER_OPTIONS}
            value={data.gender}
            onSelect={(value) => choose("gender", value)}
          />
        </div>
      )}

      {current === "location" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">어디 사세요?</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            생활 환경에 따라 기침 패턴이 달라질 수 있어요.
          </p>
          <div className="mt-6 flex flex-col gap-5">
            <SelectField
              id="country"
              label="국가"
              value={data.country}
              onChange={(value) => {
                onChange("country", value);
                onChange("region", "");
              }}
              options={COUNTRY_OPTIONS}
            />
            {isKorea ? (
              <SelectField
                id="region"
                label="지역"
                value={data.region}
                onChange={(value) => onChange("region", value)}
                options={KOREA_REGION_OPTIONS}
              />
            ) : (
              <TextField
                id="region"
                label="지역"
                value={data.region}
                onChange={(value) => onChange("region", value)}
                placeholder="예: Tokyo, Japan"
                hint={
                  data.country === ""
                    ? "국가를 먼저 선택해 주세요."
                    : "거주 중인 도시나 지역을 입력해 주세요."
                }
              />
            )}
          </div>
          {localError && (
            <p role="alert" className="mt-3 text-xs font-medium text-red-600">
              {localError}
            </p>
          )}
          <NextButton onClick={handleLocationNext} />
        </div>
      )}

      {current === "smoking" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">흡연하시나요?</h2>
          <BigChoiceList
            options={SMOKING_OPTIONS}
            value={data.smoking}
            onSelect={(value) => choose("smoking", value)}
          />
        </div>
      )}

      {current === "allergy" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">알레르기가 있으세요?</h2>
          <BigChoiceList
            options={HAS_OPTIONS}
            value={data.allergy}
            onSelect={(value) => {
              onChange("allergy", value);
              if (value === "no") window.setTimeout(goNext, ADVANCE_DELAY_MS);
            }}
          />
          {data.allergy === "yes" && (
            <div className="mt-5">
              <TextField
                id="allergyDetail"
                label="어떤 알레르기인가요? (선택)"
                value={data.allergyDetail}
                onChange={(value) => onChange("allergyDetail", value)}
                placeholder="예: 꽃가루, 집먼지진드기"
              />
              <NextButton onClick={goNext} />
            </div>
          )}
        </div>
      )}

      {current === "dustExposure" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">
            최근 2주 내 미세먼지·대기오염이 심한 곳에 계셨나요?
          </h2>
          <BigChoiceList
            options={YES_NO_OPTIONS}
            value={data.dustExposure}
            onSelect={(value) => choose("dustExposure", value)}
          />
        </div>
      )}

      {current === "hasPet" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">반려동물을 기르고 계세요?</h2>
          <BigChoiceList
            options={YES_NO_OPTIONS}
            value={data.hasPet}
            onSelect={(value) => choose("hasPet", value)}
          />
        </div>
      )}

      {current === "livingEnvironment" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">주로 어떤 환경에서 생활하세요?</h2>
          <BigChoiceList
            options={LIVING_ENVIRONMENT_OPTIONS}
            value={data.livingEnvironment}
            onSelect={(value) => choose("livingEnvironment", value)}
          />
        </div>
      )}

      {current === "firstVisit" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">ANiMA 첫 방문이신가요?</h2>
          <BigChoiceList
            options={YES_NO_OPTIONS}
            value={data.firstVisit}
            onSelect={(value) => choose("firstVisit", value)}
          />
        </div>
      )}

      {current === "visitPurpose" && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">오늘은 어떤 목적으로 오셨어요?</h2>
          <BigChoiceList
            options={VISIT_PURPOSE_OPTIONS}
            value={data.visitPurpose}
            onSelect={(value) => choose("visitPurpose", value)}
          />
        </div>
      )}
    </div>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent"
    >
      다음
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
