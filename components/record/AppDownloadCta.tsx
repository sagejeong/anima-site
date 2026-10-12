"use client";

import { useState } from "react";

// 앱스토어 출시 전이라 눌러도 다운로드는 안 되고, 출시 예정 안내만 보여줌.
// 재녹음은 헤더 "기침 체크하기" 버튼으로 이미 어디서든 가능해서, 여긴 앱 알리는 자리로 씀
export default function AppDownloadCta() {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setShowNotice(true)}
        className="flex w-full flex-col items-center gap-1 rounded-2xl bg-primary px-6 py-5 text-center text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent"
      >
        <span className="text-base font-bold sm:text-lg">ANiMA 앱 다운로드</span>
        <span className="text-sm text-white/80">
          더 자주 기록할수록, 더 정확해져요.
        </span>
      </button>
      {showNotice && (
        <p role="status" className="text-sm font-medium text-ink-soft">
          앱 출시를 준비하고 있어요. 2026년 12월 출시 예정입니다.
        </p>
      )}
    </div>
  );
}
