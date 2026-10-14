"use client";

import { useEffect, useState } from "react";
import FormField from "@/components/hub/FormField";

type ToggleRow = {
  key: string;
  label: string;
  description: string;
};

const NOTIFICATION_ROWS: readonly ToggleRow[] = [
  { key: "critical", label: "경고 알림", description: "경고 단계 감지 시 즉시 알림을 받습니다." },
  { key: "caution", label: "주의 알림", description: "주의 단계 감지 시 알림을 받습니다." },
  { key: "daily", label: "일일 요약", description: "매일 오전 시설 요약을 이메일로 받습니다." },
] as const;

type FacilitySettings = {
  siteName: string;
  adminName: string;
  email: string;
};

// 설정 화면. 시설 정보는 실제로 저장되고, 수정할 땐 로그인 비밀번호 확인이 필요함.
// 알림 설정은 아직 저장 백엔드 없어서 새로고침하면 초기화됨(데모용)
export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    critical: true,
    caution: true,
    daily: false,
  });
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const [settings, setSettings] = useState<FacilitySettings | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<FacilitySettings>({ siteName: "", adminName: "", email: "" });
  const [password, setPassword] = useState("");
  const [facilityError, setFacilityError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/hub/settings")
      .then((res) => res.json())
      .then((body: { settings: FacilitySettings }) => setSettings(body.settings));
  }, []);

  const startEditing = () => {
    if (!settings) return;
    setDraft(settings);
    setPassword("");
    setFacilityError(null);
    setIsEditing(true);
  };

  const handleFacilitySave = async () => {
    if (!draft.siteName.trim() || !draft.adminName.trim() || !draft.email.trim()) {
      setFacilityError("시설명·관리자 이름·이메일을 모두 입력해 주세요.");
      return;
    }
    if (!password) {
      setFacilityError("로그인 비밀번호를 입력해야 수정할 수 있습니다.");
      return;
    }
    setIsSaving(true);
    setFacilityError(null);

    const response = await fetch("/api/hub/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, password }),
    });

    setIsSaving(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setFacilityError(body?.error ?? "수정하지 못했습니다.");
      return;
    }

    const body: { settings: FacilitySettings } = await response.json();
    setSettings(body.settings);
    setIsEditing(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <div>
        <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
          설정
        </p>
        <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
          시설 · 계정 설정
        </h1>
      </div>

      <section className="rounded-2xl border border-line bg-steel-surface p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink">시설 정보</p>
          {!isEditing && settings && (
            <button
              type="button"
              onClick={startEditing}
              className="text-sm font-bold text-primary underline underline-offset-4"
            >
              수정
            </button>
          )}
        </div>

        {!settings ? (
          <p className="mt-5 text-sm text-ink-soft">불러오는 중...</p>
        ) : !isEditing ? (
          <dl className="mt-5 flex flex-col gap-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">로그인 아이디</dt>
              <dd className="font-semibold text-ink">admin</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">시설명</dt>
              <dd className="font-semibold text-ink">{settings.siteName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">관리자 이름</dt>
              <dd className="font-semibold text-ink">{settings.adminName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">이메일</dt>
              <dd className="font-semibold text-ink">{settings.email}</dd>
            </div>
          </dl>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            <FormField
              label="시설명"
              name="site"
              value={draft.siteName}
              onChange={(event) => setDraft((prev) => ({ ...prev, siteName: event.target.value }))}
            />
            <FormField
              label="관리자 이름"
              name="name"
              value={draft.adminName}
              onChange={(event) => setDraft((prev) => ({ ...prev, adminName: event.target.value }))}
            />
            <FormField
              label="이메일"
              type="email"
              name="email"
              value={draft.email}
              onChange={(event) => setDraft((prev) => ({ ...prev, email: event.target.value }))}
            />

            <div className="mt-2 border-t border-line pt-4">
              <FormField
                label="로그인 비밀번호 확인"
                type="password"
                name="confirmPassword"
                placeholder="수정하려면 현재 로그인 비밀번호를 입력하세요"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {facilityError && <p className="text-sm font-bold text-critical">{facilityError}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => void handleFacilitySave()}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              >
                {isSaving ? "저장 중..." : "수정완료"}
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
        )}
      </section>

      <section className="rounded-2xl border border-line bg-steel-surface p-6 sm:p-8">
        <p className="text-sm font-bold text-ink">알림 설정</p>
        <ul className="mt-5 flex flex-col gap-4">
          {NOTIFICATION_ROWS.map((row) => (
            <li key={row.key} className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-ink">{row.label}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{row.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={toggles[row.key]}
                onClick={() =>
                  setToggles((prev) => ({ ...prev, [row.key]: !prev[row.key] }))
                }
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  toggles[row.key] ? "bg-primary" : "bg-line"
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    toggles[row.key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => setSavedAt(Date.now())}
        className="self-start rounded-full bg-ink px-6 py-3 text-sm font-bold text-steel transition-colors hover:bg-primary"
      >
        변경사항 저장
      </button>
      <p role="status" className="-mt-4 text-xs text-ink-soft">
        {savedAt ? "저장했어요. " : ""}
        데모 화면이라 새로고침하면 다시 초기화됩니다.
      </p>
    </div>
  );
}
