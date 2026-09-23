"use client";

import { useState } from "react";
import { TextField } from "@/components/form/Fields";

type SubmitState = "idle" | "submitting" | "unavailable" | "done";

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>("idle");

  const handleSubmit = async (): Promise<void> => {
    if (newPassword.length < 8) {
      setError("새 비밀번호는 8자 이상이어야 합니다.");
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
      // 지금은 서버에 이 기능이 없어 항상 실패 분기를 탑니다.
      if (response.ok) {
        setState("done");
        setCurrentPassword("");
        setNewPassword("");
        setNewPasswordConfirm("");
      } else {
        setState("unavailable");
      }
    } catch {
      setState("unavailable");
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
          hint="8자 이상"
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

      {state === "unavailable" && (
        <p className="mt-3 text-sm text-ink-soft">
          아직 서버에서 지원하지 않는 기능이에요. 곧 지원할 예정이에요.
        </p>
      )}
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
