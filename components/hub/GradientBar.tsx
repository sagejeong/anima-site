type GradientBarProps = {
  className?: string;
};

// 브랜드 그라디언트 바. 시그니처 장식이라 여기저기 반복하지 말고 구간 나눌 때만
export default function GradientBar({ className = "h-1.5" }: GradientBarProps) {
  return <div aria-hidden="true" className={`gradient-bar w-full ${className}`} />;
}
