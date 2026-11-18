"use client";

import { useState } from "react";

type GuestIdentityCardProps = {
  uuid: string;
};

// 로그인 계정이 없는 사용자용. 데이터 삭제를 이메일로 요청할 때 본인 확인용으로 이 UUID가 필요함
export default function GuestIdentityCard({ uuid }: GuestIdentityCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-light bg-steel-surface p-6 text-center">
      <h2 className="text-lg font-bold text-ink">내 기기 ID</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        로그인 계정이 없으면 이 ID로 본인을 확인합니다. 데이터 삭제를
        요청하실 때 필요합니다.
      </p>
      <p className="mt-4 break-all rounded-xl border border-gray-light bg-cream px-4 py-3 font-mono text-sm text-ink">
        {uuid}
      </p>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="mt-4 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
      >
        {copied ? "복사했어요" : "복사하기"}
      </button>
    </div>
  );
}
