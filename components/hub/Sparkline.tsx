type SparklineProps = {
  values: readonly number[];
  /** 라인/끝점 색, 예: "var(--color-critical)" */
  color: string;
  width?: number;
  height?: number;
  className?: string;
};

// 표 안에 넣는 작은 추이 그래프, 0~100 스케일 기준
export default function Sparkline({
  values,
  color,
  width = 96,
  height = 32,
  className = "",
}: SparklineProps) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * step;
    const y = height - ((value - min) / range) * (height - 4) - 2;
    return { x, y };
  });

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label={`최근 추이, 현재값 ${values[values.length - 1]}`}
    >
      <path d={areaPath} fill={color} opacity="0.12" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.4" fill={color} />
    </svg>
  );
}
