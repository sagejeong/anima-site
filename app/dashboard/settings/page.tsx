"use client";

import { useState } from "react";
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

// 설정 화면. 저장 백엔드 없어서 새로고침하면 바꾼 값 초기화됨 (데모용)
export default function SettingsPage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    critical: true,
    caution: true,
    daily: false,
  });

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
        <p className="text-sm font-bold text-ink">시설 정보</p>
        <div className="mt-5 flex flex-col gap-4">
          <FormField label="시설명" name="site" placeholder="예: 행복요양원" required={false} />
          <FormField label="관리자 이름" name="name" placeholder="이름" required={false} />
          <FormField label="이메일" type="email" name="email" placeholder="admin@company.com" required={false} />
        </div>
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
        className="self-start rounded-full bg-ink px-6 py-3 text-sm font-bold text-steel transition-colors hover:bg-primary"
      >
        변경사항 저장
      </button>
      <p className="-mt-4 text-xs text-ink-soft">
        데모 화면입니다. 새로고침하면 변경 사항이 초기화됩니다.
      </p>
    </div>
  );
}
