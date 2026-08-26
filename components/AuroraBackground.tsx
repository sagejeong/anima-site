/**
 * 배경에서 아주 느리게 떠다니는 블러 덩어리.
 * CSS 애니메이션만 쓰므로 자바스크립트 비용이 없고, transform만 움직여
 * 레이아웃을 다시 계산하지 않습니다.
 */
export default function AuroraBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -left-[10%] -top-[20%] h-[42rem] w-[42rem] animate-drift-a rounded-full bg-primary/20 blur-[110px]" />
      <div className="absolute -right-[15%] top-[5%] h-[36rem] w-[36rem] animate-drift-b rounded-full bg-dot-blue/15 blur-[120px]" />
      <div className="absolute bottom-[-25%] left-1/3 h-[38rem] w-[38rem] animate-drift-c rounded-full bg-accent/15 blur-[130px]" />

      {/* 아래쪽을 바탕색으로 덮어 다음 섹션과 자연스럽게 이어지게 */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-cream" />
    </div>
  );
}
