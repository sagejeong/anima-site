"use client";

import { useState } from "react";
import Link from "next/link";
import AccountStep from "@/components/signup/AccountStep";
import BasicInfoStep from "@/components/signup/BasicInfoStep";
import ConsentStep from "@/components/signup/ConsentStep";
import HealthInfoStep from "@/components/signup/HealthInfoStep";
import {
  INITIAL_SIGNUP_FORM,
  toProfilePayload,
  validateAccountStep,
  validateBasicInfoStep,
  type FormErrors,
  type SignupFormData,
} from "@/lib/signup";

const STEP_LABELS = ["동의", "기본 정보", "건강 정보"] as const;

type StepIndex = 0 | 1 | 2;

export default function SignupFlow() {
  const [step, setStep] = useState<StepIndex>(0);
  const [data, setData] = useState<SignupFormData>(INITIAL_SIGNUP_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const updateField = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ): void => {
    setData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /** 현재 단계를 검증하고, 통과하면 빈 객체를 돌려줍니다. */
  const validateCurrentStep = (): FormErrors => {
    switch (step) {
      case 0:
        return data.agreedToResearch
          ? {}
          : { agreedToResearch: "동의하셔야 다음 단계로 넘어갈 수 있습니다." };
      case 1:
        return validateBasicInfoStep(data);
      default:
        return {}; // 건강 정보는 전부 선택 입력
    }
  };

  const submit = async (): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toProfilePayload(data)),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setSubmitError(
          body?.error ?? "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
        return;
      }

      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("네트워크에 연결하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goNext = (): void => {
    const nextErrors = validateCurrentStep();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    if (step < 2) {
      setStep((prev) => (prev + 1) as StepIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    void submit();
  };

  const goPrev = (): void => {
    setErrors({});
    setStep((prev) => Math.max(0, prev - 1) as StepIndex);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isSubmitted) {
    return <SignupComplete data={data} onChange={updateField} />;
  }

  return (
    <div>
      <StepIndicator currentStep={step} />

      <div className="mt-10">
        {step === 0 && (
          <ConsentStep
            agreed={data.agreedToResearch}
            onAgreedChange={(agreed) => updateField("agreedToResearch", agreed)}
            error={errors.agreedToResearch}
          />
        )}
        {step === 1 && (
          <BasicInfoStep data={data} errors={errors} onChange={updateField} />
        )}
        {step === 2 && (
          <HealthInfoStep
            data={data}
            onChange={updateField}
            onSkip={() => void submit()}
          />
        )}
      </div>

      {submitError && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {submitError}
        </p>
      )}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={goPrev}
            disabled={isSubmitting}
            className="rounded-full border border-gray-light px-6 py-3 text-sm font-medium text-neutral-700 transition-colors hover:border-neutral-400 disabled:opacity-50 sm:text-base"
          >
            이전
          </button>
        ) : (
          <span className="hidden sm:block" />
        )}

        <button
          type="button"
          onClick={goNext}
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60 sm:text-base"
        >
          {isSubmitting ? "저장하는 중..." : step === 2 ? "완료" : "다음"}
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-neutral-500">
        다른 기기에서 만든 계정이 있으신가요?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline underline-offset-4"
        >
          로그인
        </Link>
      </p>
    </div>
  );
}

function StepIndicator({ currentStep }: { currentStep: StepIndex }) {
  return (
    <ol className="flex items-center gap-2" aria-label="가입 진행 단계">
      {STEP_LABELS.map((label, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <li key={label} className="flex flex-1 flex-col gap-2">
            <span
              className={`h-1.5 rounded-full transition-colors ${
                isDone || isCurrent ? "bg-primary" : "bg-gray-light"
              }`}
              aria-hidden="true"
            />
            <span
              className={`text-xs font-medium sm:text-sm ${
                isCurrent ? "text-primary" : "text-neutral-400"
              }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

type SignupCompleteProps = {
  data: SignupFormData;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
};

type AccountLinkStatus = "idle" | "submitting" | "done";

/**
 * 참여 정보 저장은 이미 끝난 뒤의 화면입니다.
 * 계정 만들기는 완전히 선택 사항 — 안 만들어도 지금까지의 기록은 이미 저장돼 있습니다.
 * 다른 기기에서도 이어보고 싶을 때만 아이디를 만들면 됩니다.
 */
function SignupComplete({ data, onChange }: SignupCompleteProps) {
  const [showAccountForm, setShowAccountForm] = useState<boolean>(false);
  const [accountErrors, setAccountErrors] = useState<FormErrors>({});
  const [accountStatus, setAccountStatus] = useState<AccountLinkStatus>("idle");
  const [accountError, setAccountError] = useState<string | null>(null);

  const submitAccount = async (): Promise<void> => {
    const nextErrors = validateAccountStep(data);
    if (Object.keys(nextErrors).length > 0) {
      setAccountErrors(nextErrors);
      return;
    }
    setAccountErrors({});
    setAccountStatus("submitting");
    setAccountError(null);

    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: data.userId,
          password: data.password,
          recovery_email: data.recoveryEmail || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setAccountError(
          response.status === 409
            ? "이미 사용 중인 아이디입니다. 다른 아이디를 입력해 주세요."
            : (body?.error ?? "계정을 만들지 못했습니다. 다시 시도해 주세요."),
        );
        setAccountStatus("idle");
        return;
      }

      setAccountStatus("done");
    } catch {
      setAccountError("네트워크에 연결하지 못했습니다.");
      setAccountStatus("idle");
    }
  };

  return (
    <div className="py-10 text-center">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 text-primary"
        >
          <path d="m5 13 4 4L19 7" />
        </svg>
      </div>

      <h2 className="mt-6 text-2xl font-bold text-neutral-900">
        참여해 주셔서 감사합니다
      </h2>
      <p className="mt-3 text-base leading-relaxed text-neutral-600">
        입력하신 내용이 저장되었습니다.
        <br />
        이제 첫 기침 녹음을 시작할 수 있습니다.
      </p>

      {accountStatus === "done" ? (
        <p className="mx-auto mt-8 max-w-md rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-relaxed text-neutral-700">
          계정이 만들어졌습니다. 다른 기기에서도 같은 아이디로 로그인하면 지금
          기록을 이어서 볼 수 있어요.
        </p>
      ) : showAccountForm ? (
        <div className="mx-auto mt-8 max-w-sm text-left">
          <AccountStep data={data} errors={accountErrors} onChange={onChange} />

          {accountError && (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {accountError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void submitAccount()}
            disabled={accountStatus === "submitting"}
            className="mt-6 w-full rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60"
          >
            {accountStatus === "submitting" ? "만드는 중..." : "계정 만들기"}
          </button>
        </div>
      ) : (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-light bg-neutral-50 p-5">
          <p className="text-sm font-medium text-neutral-700">
            이 브라우저가 아닌 곳에서도 기록을 이어보고 싶으신가요?
          </p>
          <button
            type="button"
            onClick={() => setShowAccountForm(true)}
            className="mt-3 rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          >
            아이디 만들기 (선택)
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/record"
          className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent"
        >
          기침 녹음하러 가기
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-neutral-500 underline underline-offset-4"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
