"use client";

import { useState } from "react";
import { TextField } from "@/components/form/Fields";

type EmailFormProps = {
  /** 서버에서 미리 읽어온 현재 복구용 이메일. 조회 기능이 없으면 null입니다. */
  currentEmail: string | null;
};

type SubmitState = "idle" | "submitting" | "unavailable" | "done";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailForm({ currentEmail }: EmailFormProps) {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (): Promise<void> => {
    if (!EMAIL_PATTERN.test(email)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }
    setError(null);
    setState("submitting");

    try {
      const response = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recovery_email: email }),
      });
      // 지금은 서버에 이 기능이 없어 항상 실패 분기를 탑니다.
      setState(response.ok ? "done" : "unavailable");
    } catch {
      setState("unavailable");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-light bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between border-b border-gray-light pb-4">
        <span className="text-sm text-neutral-500">현재 이메일</span>
        <span className="text-sm font-medium text-neutral-900">
          {currentEmail ?? "확인할 수 없어요"}
        </span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-neutral-600">
        비밀번호를 잊었을 때 계정을 되찾는 데만 쓰여요.
      </p>

      <div className="mt-4">
        <TextField
          id="settingsEmail"
          label="새 이메일"
          type="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setError(null);
            setState("idle");
          }}
          placeholder="example@email.com"
          autoComplete="email"
          error={error ?? undefined}
        />
      </div>

      {state === "unavailable" && (
        <p className="mt-3 text-sm text-neutral-500">
          아직 서버에서 지원하지 않는 기능이에요. 곧 지원할 예정이에요.
        </p>
      )}
      {state === "done" && (
        <p className="mt-3 text-sm font-medium text-emerald-600">
          이메일이 변경되었습니다.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={state === "submitting" || email === ""}
        className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
      >
        {state === "submitting" ? "변경하는 중..." : "이메일 변경"}
      </button>
    </div>
  );
}
