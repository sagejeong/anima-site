"use client";

import {
  RadioGroupField,
  SelectField,
  TextField,
} from "@/components/form/Fields";
import {
  COUNTRY_OPTIONS,
  GENDER_OPTIONS,
  HAS_OPTIONS,
  KOREA_REGION_OPTIONS,
  LANGUAGE_OPTIONS,
  LIVING_ENVIRONMENT_OPTIONS,
  SMOKING_OPTIONS,
  VISIT_PURPOSE_OPTIONS,
  YES_NO_OPTIONS,
  type FormErrors,
  type SignupFormData,
} from "@/lib/signup";

type BasicInfoStepProps = {
  data: SignupFormData;
  errors: FormErrors;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
};

/** 3단계: 기본 정보 (분석 기준선을 잡는 데 쓰이는 배경 정보) */
export default function BasicInfoStep({
  data,
  errors,
  onChange,
}: BasicInfoStepProps) {
  const isKorea = data.country === "kr";

  return (
    <div>
      <h2 className="text-xl font-bold text-ink sm:text-2xl">
        기본 정보
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        기침 소리는 나이·흡연 여부·생활 환경에 따라 다르게 나타납니다. 정확한
        분석을 위해 사용되며, 개인을 특정하는 데는 쓰이지 않습니다.
      </p>

      <div className="mt-6 space-y-6">
        <TextField
          id="age"
          label="나이"
          type="number"
          required
          min={1}
          max={120}
          value={data.age}
          onChange={(value) => onChange("age", value)}
          placeholder="25"
          error={errors.age}
        />

        <RadioGroupField
          name="gender"
          label="성별"
          required
          value={data.gender}
          onChange={(value) => onChange("gender", value)}
          options={GENDER_OPTIONS}
          error={errors.gender}
        />

        <SelectField
          id="country"
          label="국가"
          required
          value={data.country}
          onChange={(value) => {
            onChange("country", value);
            onChange("region", ""); // 국가가 바뀌면 지역은 초기화
          }}
          options={COUNTRY_OPTIONS}
          error={errors.country}
        />

        {isKorea ? (
          <SelectField
            id="region"
            label="지역"
            required
            value={data.region}
            onChange={(value) => onChange("region", value)}
            options={KOREA_REGION_OPTIONS}
            error={errors.region}
          />
        ) : (
          <TextField
            id="region"
            label="지역"
            required
            value={data.region}
            onChange={(value) => onChange("region", value)}
            placeholder="예: Tokyo, Japan"
            hint={
              data.country === ""
                ? "국가를 먼저 선택해 주세요."
                : "거주 중인 도시나 지역을 입력해 주세요."
            }
            error={errors.region}
          />
        )}

        <RadioGroupField
          name="smoking"
          label="흡연 여부"
          required
          value={data.smoking}
          onChange={(value) => onChange("smoking", value)}
          options={SMOKING_OPTIONS}
          error={errors.smoking}
        />

        <div>
          <RadioGroupField
            name="allergy"
            label="알레르기 여부"
            required
            value={data.allergy}
            onChange={(value) => onChange("allergy", value)}
            options={HAS_OPTIONS}
            error={errors.allergy}
          />
          {data.allergy === "yes" && (
            <div className="mt-3">
              <TextField
                id="allergyDetail"
                label="어떤 알레르기인가요? (선택)"
                value={data.allergyDetail}
                onChange={(value) => onChange("allergyDetail", value)}
                placeholder="예: 꽃가루, 집먼지진드기"
              />
            </div>
          )}
        </div>

        <RadioGroupField
          name="dustExposure"
          label="최근 2주 내 미세먼지·대기오염이 심한 곳에 있었나요?"
          required
          value={data.dustExposure}
          onChange={(value) => onChange("dustExposure", value)}
          options={YES_NO_OPTIONS}
          error={errors.dustExposure}
        />

        <RadioGroupField
          name="hasPet"
          label="반려동물을 기르고 있나요?"
          required
          value={data.hasPet}
          onChange={(value) => onChange("hasPet", value)}
          options={YES_NO_OPTIONS}
          error={errors.hasPet}
        />

        <RadioGroupField
          name="livingEnvironment"
          label="주로 생활하는 환경"
          required
          value={data.livingEnvironment}
          onChange={(value) => onChange("livingEnvironment", value)}
          options={LIVING_ENVIRONMENT_OPTIONS}
          error={errors.livingEnvironment}
        />

        <RadioGroupField
          name="firstVisit"
          label="ANiMA 첫 방문이신가요?"
          required
          value={data.firstVisit}
          onChange={(value) => onChange("firstVisit", value)}
          options={YES_NO_OPTIONS}
          error={errors.firstVisit}
        />

        <RadioGroupField
          name="language"
          label="주 사용 언어"
          required
          value={data.language}
          onChange={(value) => onChange("language", value)}
          options={LANGUAGE_OPTIONS}
          error={errors.language}
        />

        <RadioGroupField
          name="visitPurpose"
          label="방문 목적"
          required
          value={data.visitPurpose}
          onChange={(value) => onChange("visitPurpose", value)}
          options={VISIT_PURPOSE_OPTIONS}
          error={errors.visitPurpose}
        />
      </div>
    </div>
  );
}
