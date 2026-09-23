const WAVE_BARS = [0.4, 0.7, 1, 0.55, 0.85, 0.35, 0.95, 0.5, 0.7, 0.4, 0.6, 0.9];

// 히어로용 애니메이션 그래픽. 뒤에 떠다니는 그라디언트 블롭 + 앞에 오디오 파형.
// "우리가 소리를 분석한다"는 걸 장식이 아니라 제품 정체성으로 바로 보여주려는 용도
export default function HeroGraphic() {
  return (
    <div className="relative flex h-72 w-full max-w-md items-center justify-center sm:h-80">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -left-10 -top-10 h-64 w-64 animate-drift-a rounded-full bg-primary/30 blur-[70px]" />
        <div className="absolute -right-6 top-6 h-56 w-56 animate-drift-b rounded-full bg-[#ff3d1f]/25 blur-[70px]" />
        <div className="absolute bottom-[-3rem] left-1/3 h-56 w-56 animate-drift-c rounded-full bg-[#ffc233]/25 blur-[70px]" />
      </div>

      <div className="relative flex h-40 items-end gap-1.5 rounded-3xl border border-line bg-steel-surface/80 px-8 py-6 shadow-2xl shadow-black/40 backdrop-blur">
        {WAVE_BARS.map((peak, index) => (
          <span
            key={index}
            className="w-2 origin-bottom animate-wave rounded-full gradient-brand-bg"
            style={{
              height: `${peak * 100}%`,
              animationDelay: `${index * 90}ms`,
              animationDuration: `${1.1 + (index % 4) * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
