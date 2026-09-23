type Point = { label: string; value: number };

type LineChartProps = {
  points: readonly Point[];
  color?: string;
  className?: string;
  svgClassName?: string;
  showLabels?: boolean;
};

const VIEW_WIDTH = 480;
const VIEW_HEIGHT = 160;
const GRID_ROWS = 4;

// 시간대별 추이 그래프. viewBox 기반이라 고정 px 아니고 컨테이너에 맞춰 늘어남
export default function LineChart({
  points,
  color = "var(--color-primary)",
  className = "",
  svgClassName = "h-40 w-full sm:h-48",
  showLabels = true,
}: LineChartProps) {
  const max = Math.max(...points.map((p) => p.value), 10);
  const step = VIEW_WIDTH / (points.length - 1);

  const coords = points.map((point, index) => ({
    x: index * step,
    y: VIEW_HEIGHT - (point.value / max) * (VIEW_HEIGHT - 16) - 8,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${VIEW_WIDTH},${VIEW_HEIGHT} L0,${VIEW_HEIGHT} Z`;
  const last = coords[coords.length - 1];

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        className={svgClassName}
        preserveAspectRatio="none"
        role="img"
        aria-label="시간대별 시설 평균 이탈도 추이"
      >
        {Array.from({ length: GRID_ROWS }).map((_, i) => {
          const y = (VIEW_HEIGHT / (GRID_ROWS - 1)) * i;
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2={VIEW_WIDTH}
              y2={y}
              stroke="var(--color-line)"
              strokeWidth="1"
            />
          );
        })}

        <path d={areaPath} fill={color} opacity="0.12" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r="4" fill={color} />
        <circle cx={last.x} cy={last.y} r="7" fill={color} opacity="0.2" />
      </svg>

      {showLabels && (
        <div className="mt-2 flex justify-between text-[11px] font-medium text-ink-soft">
          {points.map((point, index) => (
            <span key={`${point.label}-${index}`}>{point.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
