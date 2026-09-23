type Bar = { label: string; value: number };

type BarChartProps = {
  bars: readonly Bar[];
  className?: string;
  svgClassName?: string;
  showLabels?: boolean;
};

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 160;

// 일자별 막대그래프. 마지막(오늘) 막대만 강조색, viewBox 기반이라 반응형으로 늘어남
export default function BarChart({
  bars,
  className = "",
  svgClassName = "h-40 w-full sm:h-48",
  showLabels = true,
}: BarChartProps) {
  const max = Math.max(...bars.map((b) => b.value), 10);
  const gap = 10;
  const barWidth = (VIEW_WIDTH - gap * (bars.length - 1)) / bars.length;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className={svgClassName}
        preserveAspectRatio="none"
        role="img"
        aria-label="일자별 시설 평균 이탈도 집계"
      >
        <line x1="0" y1={VIEW_HEIGHT - 1} x2={VIEW_WIDTH} y2={VIEW_HEIGHT - 1} stroke="var(--color-line)" strokeWidth="1" />
        {bars.map((bar, index) => {
          const barHeight = (bar.value / max) * (VIEW_HEIGHT - 16);
          const x = index * (barWidth + gap);
          const isLast = index === bars.length - 1;
          return (
            <rect
              key={`${bar.label}-${index}`}
              x={x}
              y={VIEW_HEIGHT - barHeight}
              width={barWidth}
              height={barHeight}
              rx={4}
              fill={isLast ? "var(--color-primary)" : "var(--color-line)"}
            />
          );
        })}
      </svg>

      {showLabels && (
        <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-soft">
          {bars.map((bar, index) => (
            <span key={`${bar.label}-${index}`}>{bar.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
