import Link from "next/link";

type RecordButtonSize = "sm" | "md" | "lg";

type RecordButtonProps = {
  /** 버튼 크기 (기본값: lg) */
  size?: RecordButtonSize;
  /** 버튼 문구 (기본값: 기침 체크하기) */
  label?: string;
  className?: string;
};

const SIZE_STYLES: Record<RecordButtonSize, string> = {
  sm: "gap-1.5 px-4 py-2 text-sm",
  md: "gap-2 px-6 py-3 text-sm sm:text-base",
  lg: "gap-2.5 px-8 py-4 text-base sm:text-lg",
};

const ICON_SIZES: Record<RecordButtonSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-5 w-5",
};

/**
 * 기침 녹음 CTA 버튼.
 * 녹음 자체는 로그인 없이 가능하고, 분석을 요청할 때만 계정이 필요합니다.
 */
export default function RecordButton({
  size = "lg",
  label = "기침 체크하기",
  className = "",
}: RecordButtonProps) {
  return (
    <Link
      href="/record"
      className={`inline-flex items-center justify-center rounded-full bg-primary font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-accent ${SIZE_STYLES[size]} ${className}`}
    >
      <MicIcon className={ICON_SIZES[size]} />
      {label}
    </Link>
  );
}

function MicIcon({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
