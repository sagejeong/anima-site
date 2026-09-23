"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SettingsMenuProps = {
  userId: string;
};

type DeleteState = "idle" | "confirming" | "deleting" | "unavailable";

export default function SettingsMenu({ userId }: SettingsMenuProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [deleteState, setDeleteState] = useState<DeleteState>("idle");

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  };

  const handleConfirmDelete = async (): Promise<void> => {
    setDeleteState("deleting");
    try {
      const response = await fetch("/api/account/delete", { method: "POST" });
      if (response.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      // 지금은 서버에 삭제 기능이 없어 항상 이 분기를 탑니다.
      setDeleteState("unavailable");
    } catch {
      setDeleteState("unavailable");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-2xl border border-gray-light bg-steel-surface">
        <MenuRow label="로그인 계정" value={userId} />
        <MenuRowLink label="복구용 이메일 변경" href="/settings/email" />
        <MenuRowLink label="비밀번호 변경" href="/settings/password" />
      </div>

      <button
        type="button"
        onClick={() => void handleLogout()}
        disabled={isLoggingOut}
        className="self-start rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
      >
        {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
      </button>

      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 sm:p-8">
        <p className="text-sm font-semibold text-red-400">계정 탈퇴</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          탈퇴하면 지금까지 쌓인 기침 기록이 함께 삭제되며, 되돌릴 수 없어요.
        </p>
        <button
          type="button"
          onClick={() => setDeleteState("confirming")}
          className="mt-5 rounded-full border border-red-500/30 px-5 py-2.5 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
        >
          계정 탈퇴하기
        </button>
      </div>

      {(deleteState === "confirming" ||
        deleteState === "deleting" ||
        deleteState === "unavailable") && (
        <ConfirmDeleteModal
          state={deleteState}
          onCancel={() => setDeleteState("idle")}
          onConfirm={() => void handleConfirmDelete()}
        />
      )}
    </div>
  );
}

function MenuRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-light px-5 py-4 last:border-b-0">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <span className="text-sm text-ink-soft">{value}</span>
    </div>
  );
}

function MenuRowLink({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between border-b border-gray-light px-5 py-4 transition-colors last:border-b-0 hover:bg-steel-surface"
    >
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <ChevronIcon />
    </Link>
  );
}

function ChevronIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-ink-soft"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function ConfirmDeleteModal({
  state,
  onCancel,
  onConfirm,
}: {
  state: DeleteState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-steel-surface p-6 text-center shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {state === "unavailable" ? (
          <>
            <h2 className="text-lg font-bold text-ink">
              아직 준비 중인 기능이에요
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              계정·기록 삭제는 현재 서버에서 지원하지 않아요. 지금은 로그아웃만
              가능합니다. 곧 지원할 예정이에요.
            </p>
            <button
              type="button"
              onClick={onCancel}
              className="mt-6 w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent"
            >
              확인
            </button>
          </>
        ) : (
          <>
            <h2 id="delete-account-title" className="text-lg font-bold text-ink">
              정말 탈퇴하시겠어요?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              탈퇴하면 지금까지의 기침 기록이 함께 삭제되며, 되돌릴 수 없어요.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={state === "deleting"}
                className="flex-1 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-line disabled:opacity-60"
              >
                취소
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={state === "deleting"}
                className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {state === "deleting" ? "탈퇴하는 중..." : "탈퇴하기"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
