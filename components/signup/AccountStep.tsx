"use client";

import { useState } from "react";
import { TextField } from "@/components/form/Fields";
import {
  USER_ID_PATTERN,
  isReservedUserId,
  type FormErrors,
  type SignupFormData,
} from "@/lib/signup";

type AccountStepProps = {
  data: SignupFormData;
  errors: FormErrors;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
};

type CheckStatus = "idle" | "checking" | "available" | "taken" | "error";

const CHECK_MESSAGES: Record<Exclude<CheckStatus, "idle">, { text: string; className: string }> = {
  checking: { text: "확인 중...", className: "text-ink-soft" },
  available: { text: "사용할 수 있는 아이디예요.", className: "text-emerald-600" },
  taken: { text: "이미 사용 중인 아이디예요.", className: "text-red-600" },
  error: { text: "확인하지 못했어요. 잠시 후 다시 시도해 주세요.", className: "text-red-600" },
};

/** 계정 정보 입력 (개인 식별 정보를 받지 않는 ID 기반). 참여 정보 저장 후 선택적으로 노출됩니다. */
export default function AccountStep({
  data,
  errors,
  onChange,
}: AccountStepProps) {
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");

  const handleCheckUserId = async (): Promise<void> => {
    if (!USER_ID_PATTERN.test(data.userId)) {
      setCheckStatus("idle");
      return;
    }
    if (isReservedUserId(data.userId)) {
      setCheckStatus("taken");
      return;
    }

    setCheckStatus("checking");
    try {
      const response = await fetch(
        `/api/account/check?user_id=${encodeURIComponent(data.userId)}`,
      );
      if (!response.ok) {
        setCheckStatus("error");
        return;
      }
      const body: { available: boolean } = await response.json();
      setCheckStatus(body.available ? "available" : "taken");
    } catch {
      setCheckStatus("error");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-ink sm:text-2xl">
        계정 만들기
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        이름·연락처는 받지 않습니다. 여기서 만든 ID만 연구 데이터의 식별 번호로
        사용됩니다.
      </p>

      <div className="mt-6 space-y-5">
        <div>
          <TextField
            id="userId"
            label="아이디"
            required
            value={data.userId}
            onChange={(value) => {
              onChange("userId", value);
              setCheckStatus("idle");
            }}
            placeholder="animauser"
            hint="영문, 숫자 조합 4~20자. 실명이나 생년월일은 피해 주세요."
            autoComplete="username"
            error={errors.userId}
            trailingAction={{
              label: "중복확인",
              onClick: () => void handleCheckUserId(),
              disabled: checkStatus === "checking" || data.userId === "",
            }}
          />
          {checkStatus !== "idle" && (
            <p className={`mt-1.5 text-xs font-medium ${CHECK_MESSAGES[checkStatus].className}`}>
              {CHECK_MESSAGES[checkStatus].text}
            </p>
          )}
        </div>

        <TextField
          id="password"
          label="비밀번호"
          type="password"
          required
          value={data.password}
          onChange={(value) => onChange("password", value)}
          hint="숫자, 영문, 특수문자 포함 8자 이상"
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

      <p className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4 text-xs leading-relaxed text-ink-soft sm:text-sm">
        이메일을 입력하지 않으시면 비밀번호를 잊었을 때 계정을 복구할 방법이
        없습니다. 아이디와 비밀번호를 안전한 곳에 기록해 두세요.
      </p>
    </div>
  );
}
