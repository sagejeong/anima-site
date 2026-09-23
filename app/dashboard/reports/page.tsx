import { DownloadIcon } from "@/components/hub/icons";
import { DEMO_RESIDENTS } from "@/lib/dashboard-demo";

type ReportKind = {
  title: string;
  description: string;
};

const REPORT_KINDS: readonly ReportKind[] = [
  { title: "주간 시설 리포트", description: "지난 7일간 시설 평균 이탈도와 상태 분포를 정리합니다." },
  { title: "병동별 리포트", description: "병동 단위로 양호 · 주의 · 경고 인원을 비교합니다." },
  { title: "입소자별 리포트", description: "개별 입소자의 오전/오후 체크인 기록을 기간별로 모아 보여줍니다." },
] as const;

// 발표용 리포트 화면, 대시보드랑 같은 예시 데이터로 요약 수치 채움
export default function ReportsPage() {
  const good = DEMO_RESIDENTS.filter((r) => r.status === "양호").length;
  const caution = DEMO_RESIDENTS.filter((r) => r.status === "주의").length;
  const critical = DEMO_RESIDENTS.filter((r) => r.status === "경고").length;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-hub-label text-sm font-bold uppercase tracking-[0.25em] text-ink-soft">
            보고서
          </p>
          <h1 className="mt-1 font-hub-display text-3xl font-black tracking-tight text-ink">
            시설 리포트
          </h1>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
          예시 데이터
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 rounded-2xl border border-line bg-steel-surface p-6">
        <SummaryStat label="전체 인원" value={DEMO_RESIDENTS.length} />
        <SummaryStat label="양호" value={good} tone="text-good" />
        <SummaryStat label="주의 · 경고" value={caution + critical} tone="text-critical" />
      </div>

      <ul className="flex flex-col gap-3">
        {REPORT_KINDS.map((report) => (
          <li
            key={report.title}
            className="flex flex-col gap-3 rounded-2xl border border-line bg-steel-surface p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-ink">{report.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{report.description}</p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-ink-soft"
              title="리포트 내보내기 기능은 준비 중입니다"
            >
              <DownloadIcon className="h-4 w-4" />
              PDF 내보내기
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-soft">
        위 수치는 예시 데이터 기준입니다. 리포트 내보내기(PDF) 기능은 아직 준비 중입니다.
      </p>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="text-center">
      <p className={`font-hub-label text-3xl font-extrabold tabular-nums ${tone ?? "text-ink"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold text-ink-soft">{label}</p>
    </div>
  );
}
