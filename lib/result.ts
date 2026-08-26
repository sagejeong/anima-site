/**
 * 분석 결과 화면에서 쓰는 타입과 판정 기준.
 * 임계값은 강민 님의 "DB 설계 및 저장로직 V8" 문서에 정의된
 * healthy_ref_final.json distance_quantiles를 그대로 따릅니다.
 */

export const LAST_RESULT_STORAGE_KEY = "anima:last-result";

/** healthy 분포 기준 마할라노비스 거리 분위값 */
export const DISTANCE_QUANTILES = {
  p50: 5.5149,
  p75: 6.6988,
  max: 13.912,
} as const;

export type RiskLevel = "GOOD" | "CAUTION" | "RISK";

export function classifyRisk(distance: number): RiskLevel {
  if (distance < DISTANCE_QUANTILES.p50) return "GOOD";
  if (distance < DISTANCE_QUANTILES.p75) return "CAUTION";
  return "RISK";
}

// "건강한", "정상", "이상" 같은 의료적 판정으로 읽힐 수 있는 단어는 쓰지 않습니다.
// ANiMA는 의료기기가 아니라 개인 참고용 음향 분석 도구이며, 여기서 말하는 기준은
// 여러 사람의 기침 데이터로 만든 "기준 패턴"이지 의학적으로 확인된 건강 여부가 아닙니다.
//
// threshold는 화면 표시용 퍼센트(toDisplayPercent) 기준입니다. p50·p75가 정확히
// 50%·75%에 오도록 설계했기 때문에(위 toDisplayPercent 참고), 이 숫자는 raw distance와
// 달리 사용자에게 그대로 보여줘도 되는 값입니다.
export const RISK_COPY: Record<
  RiskLevel,
  { label: string; threshold: string }
> = {
  GOOD: {
    label: "양호",
    threshold: "50% 미만",
  },
  CAUTION: {
    label: "주의",
    threshold: "50~75%",
  },
  RISK: {
    label: "경고",
    threshold: "75% 초과",
  },
};

/**
 * 결과 카드에 항상 붙는 짧은 한 줄 설명.
 *
 * 매 결과마다 반복해서 보는 문구라 길게 쓰면 안 읽힙니다. "왜 이런 결과가
 * 나왔을까요?" 링크가 /about으로 연결돼 있어, 자세한 설명(여러 사람의
 * 데이터로 만든 기준이라는 것, 개인화는 아직 미구현이라는 것 등)은 거기서
 * 다룹니다. 여기서는 방향(낮을수록 좋다)만 짧게 전달합니다.
 */
export const RESULT_EXPLANATION = "숫자가 낮을수록 기준 패턴과 비슷하다는 뜻이에요.";

/** 결과 카드 하단에 항상 붙는 면책 문구. */
export const MEDICAL_DISCLAIMER =
  "이 결과는 의료적 진단이 아니며, 개인 참고용입니다.";

/**
 * 원거리(raw distance)를 화면 표시용 퍼센트(0~100)로 다시 매깁니다.
 *
 * distance/maxDist*100 로 단순 환산하면 p50(5.5149)이 39.6%, p75(6.6988)가
 * 48.1%가 되어 "50% 미만 양호 / 50~75% 주의 / 75% 이상 경고"라는 판정 기준과
 * 화면 숫자가 어긋납니다. 앱은 p50을 정확히 50%, p75를 정확히 75%에 두는
 * 구간별 선형 환산을 씁니다 — 이 함수는 그 방식을 그대로 따릅니다.
 */
export function toDisplayPercent(distance: number): number {
  const { p50, p75, max } = DISTANCE_QUANTILES;

  if (distance <= p50) {
    return (distance / p50) * 50;
  }
  if (distance <= p75) {
    return 50 + ((distance - p50) / (p75 - p50)) * 25;
  }
  return Math.min(100, 75 + ((distance - p75) / (max - p75)) * 25);
}

/**
 * "2026년 8월 16일 (일) 17:37" 형식으로 표시합니다.
 * 시각 정보가 없는 "YYYY-MM-DD" 형태(record_date)가 들어오면 시간은 붙이지 않습니다.
 */
export function formatMeasuredAt(value: string | Date): string {
  const hasTimeComponent = typeof value !== "string" || value.includes("T");
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";

  const datePart = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const weekday = date.toLocaleDateString("ko-KR", { weekday: "short" });

  if (!hasTimeComponent) {
    return `${datePart} (${weekday})`;
  }

  const timePart = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${datePart} (${weekday}) ${timePart}`;
}

/**
 * 서버 응답 형식. /upload 응답 스키마가 서버에 아직 명세돼 있지 않아
 * 필드가 없거나 형식이 다를 수 있습니다. 화면은 모든 필드를 선택적으로 다룹니다.
 */
export type AnimaUploadResponse = {
  prediction?: {
    is_cough?: boolean;
    prob?: number;
    stage2?: {
      distance?: number;
      embedding?: number[];
    };
  };
  quality?: {
    quality_score?: number;
    quality_flag?: boolean;
    quality_fail_reason?: string | null;
  };
  final_prediction?: {
    final_score?: number;
    final_label?: "COUGH_HIGH" | "COUGH_LOW" | "NO_COUGH" | string;
    final_message?: string;
  };
  validation?: {
    duration?: number;
  };
};

/**
 * GET /records 가 돌려주는 측정 기록 한 건.
 * MRRecord 테이블 컬럼을 그대로 따른다고 보고 다루되, 실제 응답 스키마가
 * 서버에 명세돼 있지 않아 모든 필드를 선택적으로 처리합니다.
 */
export type MRRecordSummary = {
  record_uuid?: string;
  measured_at?: string;
  record_date?: string;
  /** DB 스키마상 NOT NULL DEFAULT(datetime('now'))라 항상 채워져 있어야 하는 값. 날짜 표시의 최후 안전망입니다. */
  created_at?: string;
  source_device_type?: string;
  cough_detected?: number | boolean | null;
  final_label?: "COUGH_HIGH" | "COUGH_LOW" | "NO_COUGH" | string | null;
  healthy_distance?: number | null;
  risk_level?: RiskLevel | string | null;
  quality_fail_reason?: string | null;
  /** 서버가 아직 이 컬럼들을 내려주지 않을 수 있어 전부 선택적입니다. */
  medication_taken?: number | boolean | null;
  medication_category?: string | null;
  medication_name?: string | null;
};

/** measured_at → record_date → created_at 순으로 존재하는 값을 씁니다. */
export function pickRecordDate(record: MRRecordSummary): string | undefined {
  return record.measured_at || record.record_date || record.created_at || undefined;
}

export type RecordsListResponse = {
  ok?: boolean;
  count?: number;
  records?: MRRecordSummary[];
};

/* --------------------------------- 최근 추이 --------------------------------- */

export type TrendPoint = {
  time: number;
  /** 점에 마우스를 올렸을 때 보이는 전체 날짜 */
  fullDateLabel: string;
  /** 축에 그리는 짧은 날짜 ("8/16") */
  shortDateLabel: string;
  percent: number;
  risk: RiskLevel;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** 최근 7일 안에서, 분석이 완료된 기록만 골라 시간순으로 정리합니다. */
export function computeTrend(
  records: readonly MRRecordSummary[],
  maxPoints = 10,
): TrendPoint[] {
  const sevenDaysAgo = Date.now() - SEVEN_DAYS_MS;

  return records
    .map((record): TrendPoint | null => {
      const dateStr = pickRecordDate(record);
      const distance = record.healthy_distance;
      if (!dateStr || typeof distance !== "number") return null;

      const time = new Date(dateStr).getTime();
      if (Number.isNaN(time)) return null;

      return {
        time,
        fullDateLabel: formatMeasuredAt(dateStr),
        shortDateLabel: new Date(time).toLocaleDateString("ko-KR", {
          month: "numeric",
          day: "numeric",
        }),
        percent: toDisplayPercent(distance),
        risk: classifyRisk(distance),
      };
    })
    .filter((point): point is TrendPoint => point !== null && point.time >= sevenDaysAgo)
    .sort((a, b) => a.time - b.time)
    .slice(-maxPoints);
}

/** 첫 기록과 마지막 기록 사이의 변화를 한 문장으로 요약합니다. 낮을수록 좋은 지표라 방향을 그대로 뒤집지 않습니다. */
export function describeTrendChange(points: readonly TrendPoint[]): string {
  if (points.length < 2) return "";

  const delta = Math.round(points[points.length - 1].percent - points[0].percent);

  if (delta <= -5) return `최근 며칠 새 ${Math.abs(delta)}%p 낮아졌어요.`;
  if (delta >= 5) return `최근 며칠 새 ${delta}%p 높아졌어요.`;
  return "최근 큰 변화 없이 안정적이에요.";
}

/**
 * 방금 업로드한 결과를 sessionStorage에 저장할 때 쓰는 형태.
 * 서버 응답 자체(response)에 더해, 서버가 알려주지 않는 값을 클라이언트에서 채웁니다:
 * - measuredAt: 녹음이 끝난 시각 (서버 응답엔 없어서 녹음 종료 시점을 그대로 씁니다)
 * - audioDataUrl: 녹음한 소리를 "기침 소리 듣기"로 재생하기 위한 data URL.
 *   blob URL은 새로고침하면 깨지므로 문자열로 안전하게 저장할 수 있는 data URL을 씁니다.
 */
export type StoredResult = {
  response: AnimaUploadResponse;
  measuredAt: string;
  audioDataUrl?: string;
  /** 분석 요청 직전 복용 중인 약 확인 단계에서 입력한 값 */
  medication?: {
    taken: boolean;
    categories: string[];
    other?: string;
  };
};

const QUALITY_FAIL_MESSAGES: Record<string, string> = {
  TOO_SHORT: "녹음이 너무 짧습니다.",
  NOISY: "주변 소음이 너무 큽니다.",
  // 서버까지 요청이 아예 도달하지 못했을 때 클라이언트에서 붙이는 사유입니다.
  UPLOAD_FAILED: "분석 요청에 실패했습니다. 네트워크를 확인하고 다시 시도해 주세요.",
};

export function qualityFailMessage(reason: string): string {
  return QUALITY_FAIL_MESSAGES[reason] ?? "녹음 품질이 기준에 못 미쳤습니다.";
}
