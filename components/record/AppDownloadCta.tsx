"use client";

// TODO: 앱스토어/플레이스토어 주소 정해지면 href 채우기, 지금은 자리만 잡아둠.
// 재녹음은 헤더 "기침 체크하기" 버튼으로 이미 어디서든 가능해서, 여긴 앱 알리는 자리로 씀
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
