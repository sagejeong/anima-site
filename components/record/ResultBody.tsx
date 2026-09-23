import Link from "next/link";
import RecordButton from "@/components/RecordButton";
import {
  MEDICAL_DISCLAIMER,
  RESULT_EXPLANATION,
  RISK_COPY,
  classifyRisk,
  formatMeasuredAt,
  qualityFailMessage,
  toDisplayPercent,
  type RiskLevel,
} from "@/lib/result";

type ResultBodyProps = {
  /** 기침이 감지됐는지. 서버가 명시적으로 false를 준 경우만 "미감지"로 취급합니다. */
  isCough?: boolean | null;
  /** 기준 패턴으로부터의 차이(raw distance). 이 값이 있어야 게이지를 그릴 수 있습니다. */
  distance?: number | null;
  /** 녹음 품질 미달 사유 (TOO_SHORT, NOISY 등) */
  failReason?: string | null;
  /** 서버가 준 안내 문장. 없으면 판정 등급의 기본 설명을 씁니다. */
  message?: string | null;
  /** 녹음이 끝난 시각 (ISO 문자열) */
  measuredAt?: string | null;
  /** 녹음한 소리를 재생할 수 있는 주소. 방금 올린 결과에만 존재합니다. */
  audioUrl?: string | null;
  /** 분석 요청 전 복용 중인 약 확인 단계에서 "있음"으로 답했는지 */
  medicationTaken?: boolean | null;
};

/**
 * 결과 카드 하나. "방금 올린 결과"(/result)와 "지난 기록 상세"(/records/[id])가
 * 같은 모양을 쓰도록 판정 로직과 화면을 여기 한 곳에 모아둡니다.
 */
export default function ResultBody({
  isCough,
  distance,
  failReason,
  message,
  measuredAt,
  audioUrl,
  medicationTaken,
}: ResultBodyProps) {
  // 기침이 감지되지 않았거나 품질 기준에 못 미치면 게이지 자체를 보여주지 않습니다.
  if (isCough === false || failReason) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-gray-light bg-steel-surface p-8 text-center sm:p-8">
        {measuredAt && <DateLine measuredAt={measuredAt} />}
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink/5"
          aria-hidden="true"
        >
          <RetryIcon />
        </div>
        <h2 className="mt-5 text-lg font-bold text-ink">
          {isCough === false
            ? "기침 소리가 감지되지 않았어요"
            : "녹음을 다시 확인해 주세요"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {failReason
            ? qualityFailMessage(failReason)
            : "조용한 곳에서 기기를 얼굴에 가까이 두고 다시 녹음해 주세요."}
        </p>
        <div className="mt-6 flex justify-center">
          <RecordButton label="다시 기침 체크하기" size="md" />
        </div>
      </div>
    );
  }

  if (typeof distance !== "number") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-gray-light bg-steel-surface p-8 text-center sm:p-8">
        {measuredAt && <DateLine measuredAt={measuredAt} />}
        <h2 className="text-lg font-bold text-ink">분석에 실패했어요</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          {message ?? "다시 녹음해 주세요."}
        </p>
        <div className="mt-6 flex justify-center">
          <RecordButton label="다시 기침 체크하기" size="md" />
        </div>
      </div>
    );
  }

  const risk = classifyRisk(distance);
  const percent = Math.round(toDisplayPercent(distance));

  return (
    <div className="w-full max-w-md rounded-2xl border border-gray-light bg-steel-surface p-6 text-center sm:p-8">
      {measuredAt && <DateLine measuredAt={measuredAt} />}

      <div className="flex flex-wrap items-center justify-center gap-2">
        <RiskBadge risk={risk} />
        {medicationTaken && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-soft">
            <span aria-hidden="true">💊</span>
            약 복용 중
          </span>
        )}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        기침 이탈도
      </p>
      <p className="mt-1 text-6xl font-bold tabular-nums text-ink">
        {percent}
        <span className="text-3xl font-semibold text-ink-soft">%</span>
      </p>

      <div className="mt-8 flex items-center justify-center gap-8">
        <VerticalGauge percent={percent} risk={risk} />
        <RiskLegend risk={risk} />
      </div>

      <p className="mt-8 text-pretty text-sm leading-relaxed text-ink-soft sm:text-base sm:leading-relaxed">
        {RESULT_EXPLANATION}
      </p>

      <Link
        href="/about"
        className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
      >
        왜 이런 결과가 나왔을까요?
      </Link>

      {audioUrl && <AudioPlayback audioUrl={audioUrl} />}

      <p className="mt-6 border-t border-gray-light pt-4 text-[11px] leading-relaxed text-ink-soft">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}

function DateLine({ measuredAt }: { measuredAt: string }) {
  return (
    <p className="mb-5 text-xs font-medium text-ink-soft">
      {formatMeasuredAt(measuredAt)}
    </p>
  );
}

function AudioPlayback({ audioUrl }: { audioUrl: string }) {
  return (
    <div className="mt-6 rounded-xl border border-gray-light bg-steel-surface p-4 text-left">
      <p className="text-xs font-medium text-ink-soft">기침 소리 듣기</p>
      <audio
        src={audioUrl}
        controls
        className="mt-2 w-full"
        aria-label="녹음한 기침 소리"
      />
    </div>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    GOOD: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    CAUTION: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    RISK: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${styles[risk]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {RISK_COPY[risk].label}
    </span>
  );
}

const GAUGE_HEIGHT_PX = 176;

/**
 * 세로 막대 게이지. 색상 구간(초록 0~50% · 노랑 50~75% · 빨강 75~100%)과 점 위치는
 * 화면 표시용 퍼센트를 그대로 씁니다. 원거리(raw distance) 숫자는 노출하지 않습니다.
 */
function VerticalGauge({ percent, risk }: { percent: number; risk: RiskLevel }) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const markerColor: Record<RiskLevel, string> = {
    GOOD: "bg-emerald-500",
    CAUTION: "bg-amber-500",
    RISK: "bg-red-500",
  };

  return (
    <div
      className="relative w-4 shrink-0 overflow-visible rounded-full bg-ink/5"
      style={{ height: `${GAUGE_HEIGHT_PX}px` }}
      role="img"
      aria-label={`기침 이탈도 ${clampedPercent}% · 판정 결과 ${RISK_COPY[risk].label}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        {/* 위에서부터 경고(빨강 75~100%) → 주의(노랑 50~75%) → 양호(초록 0~50%) */}
        <div className="w-full bg-red-500/20" style={{ height: "25%" }} />
        <div className="w-full bg-amber-500/20" style={{ height: "25%" }} />
        <div className="w-full bg-emerald-500/20" style={{ height: "50%" }} />
      </div>
      <div
        className={`absolute left-1/2 h-4 w-7 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white shadow ${markerColor[risk]}`}
        style={{ bottom: `${clampedPercent}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

const LEGEND_ITEMS: readonly { level: RiskLevel; dot: string }[] = [
  { level: "RISK", dot: "bg-red-500" },
  { level: "CAUTION", dot: "bg-amber-500" },
  { level: "GOOD", dot: "bg-emerald-500" },
];

// 색상·판정 이름·퍼센트 범례. 경고→주의→양호 순(위→아래)으로 게이지랑 나란히 둠.
// 퍼센트(50%/75%)는 화면 표시용이라 그대로 보여줘도 됨, raw distance는 안 보여줌
function RiskLegend({ risk }: { risk: RiskLevel }) {
  return (
    <ul
      className="flex flex-col justify-between text-left"
      style={{ height: `${GAUGE_HEIGHT_PX}px` }}
    >
      {LEGEND_ITEMS.map((item) => {
        const isCurrent = item.level === risk;
        return (
          <li key={item.level} className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${item.dot}`} aria-hidden="true" />
            <span
              className={`text-sm ${
                isCurrent ? "font-semibold text-ink" : "text-ink-soft"
              }`}
            >
              {RISK_COPY[item.level].label}
            </span>
            <span className="text-xs text-ink-soft">
              {RISK_COPY[item.level].threshold}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function RetryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6 text-ink-soft"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 1 3 6.7" />
      <path d="M3 16v-4h4" />
    </svg>
  );
}
