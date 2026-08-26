"use client";

/**
 * TODO: 앱스토어/플레이스토어 주소가 정해지면 href를 채워 주세요.
 * 지금은 자리만 잡아두고 클릭해도 아무 곳으로도 이동하지 않습니다.
 *
 * "다시 녹음하기"를 대신하는 자리입니다 — 상단 헤더에 항상 떠 있는
 * "기침 체크하기" 버튼으로 재녹음은 이미 어디서든 가능해서, 결과를 다
 * 본 다음 자리에는 재녹음 대신 앱을 알리는 편이 낫다고 판단했습니다.
 */
export default function AppDownloadCta() {
  return (
    <a
      href="#"
      onClick={(event) => event.preventDefault()}
      className="flex w-full max-w-md flex-col items-center gap-1 rounded-2xl bg-primary px-6 py-5 text-center text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent"
    >
      <span className="text-base font-bold sm:text-lg">ANiMA 앱 다운로드</span>
      <span className="text-sm text-white/80">
        더 자주 기록할수록, 더 정확해져요.
      </span>
    </a>
  );
}
