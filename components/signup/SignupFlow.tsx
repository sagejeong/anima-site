"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AccountStep from "@/components/signup/AccountStep";
import ConsentStep from "@/components/signup/ConsentStep";
import {
  INITIAL_SIGNUP_FORM,
  toProfilePayload,
  validateAccountStep,
  type FormErrors,
  type SignupFormData,
} from "@/lib/signup";

export default function SignupFlow() {
  const [data, setData] = useState<SignupFormData>(INITIAL_SIGNUP_FORM);
  const [agreementError, setAgreementError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const updateField = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ): void => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (field === "agreedToTerms") setAgreementError(undefined);
  };

  const submit = async (): Promise<void> => {
    if (!data.agreedToTerms) {
      setAgreementError("동의하셔야 다음 단계로 넘어갈 수 있습니다.");
      return;
    }
    setAgreementError(undefined);
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

  if (isSubmitted) {
    return <SignupComplete data={data} onChange={updateField} />;
  }

  return (
    <div>
      <ConsentStep
        agreed={data.agreedToTerms}
        onAgreedChange={(agreed) => updateField("agreedToTerms", agreed)}
        error={agreementError}
      />

      {submitError && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-400"
        >
          {submitError}
        </p>
      )}

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <span className="hidden sm:block" />

        <button
          type="button"
          onClick={() => void submit()}
          disabled={isSubmitting}
          className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent disabled:opacity-60 sm:text-base"
        >
          {isSubmitting ? "저장하는 중..." : "다음"}
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-ink-soft">
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

type SignupCompleteProps = {
  data: SignupFormData;
  onChange: <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K],
  ) => void;
};

type AccountLinkStatus = "idle" | "submitting" | "done";

// 서비스 이용 동의 끝난 뒤 화면. 계정은 완전 선택, 안 만들어도 기록은 이미 저장됨.
// 다른 기기에서 이어보고 싶을 때만 아이디 만들면 됨
function SignupComplete({ data, onChange }: SignupCompleteProps) {
  const router = useRouter();
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
      router.refresh();
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

      <h2 className="mt-6 text-2xl font-bold text-ink">
        이용해 주셔서 감사합니다
      </h2>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">
        동의 내용이 저장되었습니다.
        <br />
        이제 첫 기침 녹음을 시작할 수 있습니다.
      </p>

      {accountStatus === "done" ? (
        <p className="mx-auto mt-8 max-w-md rounded-xl border border-primary/25 bg-primary/5 p-4 text-sm leading-relaxed text-ink-soft">
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
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-gray-light bg-steel-surface p-5">
          <p className="text-sm font-medium text-ink-soft">
            이 브라우저가 아닌 곳에서도 기록을 이어보고 싶으신가요?
          </p>
          <button
            type="button"
            onClick={() => setShowAccountForm(true)}
            className="mt-3 rounded-full border border-line bg-steel-surface px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
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
          className="text-sm font-medium text-ink-soft underline underline-offset-4"
        >
          홈으로
        </Link>
      </div>
    </div>
  );
}
