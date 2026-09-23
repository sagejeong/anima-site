import type { HubStatus } from "@/lib/hub-mock";

const STYLES: Record<HubStatus, string> = {
  양호: "bg-good/10 text-good",
  주의: "bg-caution/10 text-caution",
  경고: "bg-critical/10 text-critical",
};

const DOT: Record<HubStatus, string> = {
  양호: "bg-good",
  주의: "bg-caution",
  경고: "bg-critical",
};

type StatusPillProps = {
  status: HubStatus;
  className?: string;
};

// 양호/주의/경고 배지. 색은 여기서만 관리 (다른 데서 임의로 색 쓰지 말 것)
export default function StatusPill({ status, className = "" }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status]}`} aria-hidden="true" />
      {status}
    </span>
  );
}
