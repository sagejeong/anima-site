"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type WorkerEditFormProps = {
  id: string;
  name: string;
  team: string;
  userUuid: string | null;
};

// 상세보기 상단의 이름·소속·앱 UUID 수정. 평소엔 보기 모드, "수정" 누르면 입력칸으로 바뀜
export default function WorkerEditForm({ id, name, team, userUuid }: WorkerEditFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [draftTeam, setDraftTeam] = useState(team);
  const [draftUuid, setDraftUuid] = useState(userUuid ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startEditing = () => {
    setDraftName(name);
    setDraftTeam(team);
    setDraftUuid(userUuid ?? "");
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!draftName.trim() || !draftTeam.trim()) {
      setErrorMessage("이름과 소속은 비워둘 수 없습니다.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);

    const response = await fetch(`/api/hub/workers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: draftName.trim(),
        team: draftTeam.trim(),
        userUuid: draftUuid.trim(),
      }),
    });

    setIsSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setErrorMessage(body?.error ?? "수정하지 못했습니다.");
      return;
    }

    setIsEditing(false);
    router.refresh();
  };

  if (!isEditing) {
    return (
      <div>
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          {team}
        </p>
        <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">{name}</h1>
        <p className="mt-1 text-xs text-ink-soft">
          {userUuid ? `본인 폰(앱)과 연결됨 · ${userUuid}` : "아직 첫 체크인 전"}
        </p>
        <button
          type="button"
          onClick={startEditing}
          className="mt-3 text-sm font-bold text-primary underline underline-offset-4"
        >
          이름·소속·UUID 수정
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line bg-steel-surface p-6 sm:max-w-md">
      <label className="block">
        <span className="text-sm font-bold text-ink">이름</span>
        <input
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-ink">소속</span>
        <input
          value={draftTeam}
          onChange={(event) => setDraftTeam(event.target.value)}
          className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-ink">앱 UUID (비워두면 연결 해제)</span>
        <input
          value={draftUuid}
          onChange={(event) => setDraftUuid(event.target.value)}
          placeholder="앱 설정 → 내 정보 → 내 UUID에서 복사한 값"
          className="mt-2 block w-full rounded-xl border border-line bg-steel px-4 py-2.5 font-hub-mono text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      {errorMessage && <p className="text-sm font-bold text-critical">{errorMessage}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-xl border border-line px-5 py-2.5 text-sm font-bold text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-60"
        >
          취소
        </button>
      </div>
    </div>
  );
}
