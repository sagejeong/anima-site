"use client";

import { useState } from "react";
import { TextField } from "@/components/form/Fields";
import { isValidSignupPassword } from "@/lib/signup";

type SubmitState = "idle" | "submitting" | "error" | "done";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (): Promise<void> => {
    if (!isValidSignupPassword(newPassword)) {
      setError("새 비밀번호는 숫자, 영문, 특수문자를 포함해 8자 이상이어야 합니다.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    setError(null);
    setState("submitting");

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setError(body?.error ?? "변경하지 못했습니다.");
        setState("error");
        return;
      }

      setState("done");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } catch {
      setError("네트워크에 연결하지 못했습니다.");
      setState("error");
    }
  };

  const resetStatus = (): void => {
    setError(null);
    setState("idle");
  };

  return (
    <div className="rounded-2xl border border-gray-light bg-steel-surface p-6 sm:p-8">
      <div className="space-y-4">
        <TextField
          id="settingsCurrentPassword"
          label="현재 비밀번호"
          type="password"
          value={currentPassword}
          onChange={(value) => {
            setCurrentPassword(value);
            resetStatus();
          }}
          autoComplete="current-password"
        />
        <TextField
          id="settingsNewPassword"
          label="새 비밀번호"
          type="password"
          value={newPassword}
          onChange={(value) => {
            setNewPassword(value);
            resetStatus();
          }}
          hint="숫자, 영문, 특수문자 포함 8자 이상"
          autoComplete="new-password"
        />
        <TextField
          id="settingsNewPasswordConfirm"
          label="새 비밀번호 확인"
          type="password"
          value={newPasswordConfirm}
          onChange={(value) => {
            setNewPasswordConfirm(value);
            resetStatus();
          }}
          autoComplete="new-password"
          error={error ?? undefined}
        />
      </div>

      {state === "done" && (
        <p className="mt-3 text-sm font-medium text-emerald-600">
          비밀번호가 변경되었습니다.
        </p>
      )}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={
          state === "submitting" ||
          currentPassword === "" ||
          newPassword === "" ||
          newPasswordConfirm === ""
        }
        className="mt-5 w-full rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent disabled:opacity-60"
      >
        {state === "submitting" ? "변경하는 중..." : "비밀번호 변경"}
      </button>
    </div>
  );
}
