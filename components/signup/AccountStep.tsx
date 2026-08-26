"use client";

import { TextField } from "@/components/form/Fields";
import type { FormErrors, SignupFormData } from "@/lib/signup";

type AccountStepProps = {
  data: SignupFormData;
  errors: FormErrors;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
};

/** 계정 정보 입력 (개인 식별 정보를 받지 않는 ID 기반). 참여 정보 저장 후 선택적으로 노출됩니다. */
export default function AccountStep({
  data,
  errors,
  onChange,
}: AccountStepProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-neutral-900 sm:text-2xl">
        계정 만들기
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        이름·연락처는 받지 않습니다. 여기서 만든 ID만 연구 데이터의 식별 번호로
        사용됩니다.
      </p>

      <div className="mt-6 space-y-5">
        <TextField
          id="userId"
          label="아이디"
          required
          value={data.userId}
          onChange={(value) => onChange("userId", value)}
          placeholder="anima_user01"
          hint="영문·숫자·밑줄(_) 4~20자. 실명이나 생년월일은 피해 주세요."
          autoComplete="username"
          error={errors.userId}
        />

        <TextField
          id="password"
          label="비밀번호"
          type="password"
          required
          value={data.password}
          onChange={(value) => onChange("password", value)}
          hint="8자 이상"
          autoComplete="new-password"
          error={errors.password}
        />

        <TextField
          id="passwordConfirm"
          label="비밀번호 확인"
          type="password"
          required
          value={data.passwordConfirm}
          onChange={(value) => onChange("passwordConfirm", value)}
          autoComplete="new-password"
          error={errors.passwordConfirm}
        />

        <TextField
          id="recoveryEmail"
          label="복구용 이메일 (선택)"
          type="email"
          value={data.recoveryEmail}
          onChange={(value) => onChange("recoveryEmail", value)}
          placeholder="example@email.com"
          hint="비밀번호 재설정에만 사용하며, 연구 데이터와 분리해 보관합니다. 입력하지 않으셔도 됩니다."
          autoComplete="email"
          error={errors.recoveryEmail}
        />
      </div>

      <p className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed text-neutral-700 sm:text-sm">
        이메일을 입력하지 않으시면 비밀번호를 잊었을 때 계정을 복구할 방법이
        없습니다. 아이디와 비밀번호를 안전한 곳에 기록해 두세요.
      </p>
    </div>
  );
}
