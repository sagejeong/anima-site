import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";
import TrendChart from "@/components/record/TrendChart";
import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";
import {
  RISK_COPY,
  classifyRisk,
  computeTrend,
  describeTrendChange,
  formatMeasuredAt,
  pickRecordDate,
  toDisplayPercent,
  type MRRecordSummary,
  type RecordsListResponse,
  type RiskLevel,
} from "@/lib/result";

export const metadata: Metadata = {
  title: "내 기록 — ANiMA",
  description: "이 브라우저에서 녹음한 기침 분석 기록입니다.",
};

const PAGE_SIZE = 10;

function resolveRisk(record: MRRecordSummary): RiskLevel | null {
  if (
    record.risk_level === "GOOD" ||
    record.risk_level === "CAUTION" ||
    record.risk_level === "RISK"
  ) {
    return record.risk_level;
  }
  if (typeof record.healthy_distance === "number") {
    return classifyRisk(record.healthy_distance);
  }
  return null;
}

type RecordsPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function RecordsPage({ searchParams }: RecordsPageProps) {
  const userUuid = await readUserUuid();
  const { page: pageParam } = await searchParams;

  const result = userUuid
    ? await callAnimaApi<RecordsListResponse>(
        animaUrl("/records", { user_uuid: userUuid }),
      )
    : null;

  // 분석이 끝나지 않았거나 실패한 기록은 목록에 남길 필요가 없어 걸러냅니다.
  // (녹음 도중 "기침 감지 안 됨" 안내와 재체크 버튼은 그 자리에서 이미 보여줬습니다.)
  const records = (result?.ok ? (result.data.records ?? []) : []).filter(
    (record) => typeof record.healthy_distance === "number",
  );

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number.isNaN(requestedPage) ? 1 : requestedPage),
  );
  const pageRecords = records.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const trend = computeTrend(records);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <h1 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            내 기록
          </h1>
          <p className="mt-3 text-center text-sm text-neutral-600 sm:text-base">
            이 브라우저에서 녹음한 기록이에요.
          </p>

          {!userUuid || (result && !result.ok) ? (
            <div className="mt-12">
              <EmptyState
                title="기록을 불러오지 못했어요"
                description="잠시 후 다시 시도해 주세요."
              />
            </div>
          ) : (
            <>
              <TrendDashboard trend={trend} />

              {records.length === 0 ? (
                <div className="mt-8">
                  <EmptyState
                    title="아직 기록이 없어요"
                    description="첫 기침을 체크하면 여기에 쌓이기 시작합니다."
                  />
                </div>
              ) : (
                <>
                  <ul className="mt-8 flex flex-col gap-3">
                    {pageRecords.map((record, index) => (
                      <RecordRow
                        key={record.record_uuid ?? `${pickRecordDate(record)}-${index}`}
                        record={record}
                      />
                    ))}
                  </ul>

                  {totalPages > 1 && (
                    <Pagination currentPage={currentPage} totalPages={totalPages} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function TrendDashboard({ trend }: { trend: ReturnType<typeof computeTrend> }) {
  const hasEnoughData = trend.length >= 2;
  const average = hasEnoughData
    ? Math.round(trend.reduce((sum, point) => sum + point.percent, 0) / trend.length)
    : null;
  const changeText = hasEnoughData ? describeTrendChange(trend) : "";

  return (
    <div className="mt-8 rounded-2xl border border-gray-light bg-white p-6 sm:p-8">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold text-neutral-900">
          최근 7일 이탈도 추이
        </p>
        {average !== null && (
          <p className="text-sm text-neutral-500">
            평균{" "}
            <span className="font-semibold tabular-nums text-neutral-900">
              {average}%
            </span>
          </p>
        )}
      </div>

      <div className="mt-4">
        <TrendChart points={trend} average={average ?? 0} />
      </div>

      {hasEnoughData ? (
        changeText && (
          <p className="mt-3 text-center text-xs text-neutral-500">{changeText}</p>
        )
      ) : (
        <p className="mt-3 text-center text-xs text-neutral-500">
          기록이 2개 이상 쌓이면 추이를 보여드려요.
        </p>
      )}
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const pageHref = (page: number): string => (page === 1 ? "/records" : `/records?page=${page}`);

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-2"
      aria-label="기록 페이지 이동"
    >
      <PageLink
        href={pageHref(currentPage - 1)}
        disabled={currentPage <= 1}
        label="이전"
      />

      <span className="px-3 text-sm text-neutral-500">
        {currentPage} / {totalPages}
      </span>

      <PageLink
        href={pageHref(currentPage + 1)}
        disabled={currentPage >= totalPages}
        label="다음"
      />
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-full border border-gray-light px-4 py-2 text-sm font-medium text-neutral-300">
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
    >
      {label}
    </Link>
  );
}

function RecordRow({ record }: { record: MRRecordSummary }) {
  const risk = resolveRisk(record);

  // 이 목록에는 분석이 성공한 기록만 남아있어(app/records/page.tsx 상단 필터 참고),
  // healthy_distance는 항상 숫자입니다.
  const summaryText =
    typeof record.healthy_distance === "number"
      ? `이탈도 ${Math.round(toDisplayPercent(record.healthy_distance))}%`
      : "";

  const dateValue = pickRecordDate(record);

  const content = (
    <>
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-900 sm:text-base">
          {dateValue ? formatMeasuredAt(dateValue) : "날짜 미상"}
        </p>
        <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
          {summaryText}
        </p>
      </div>

      {risk && (
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            risk === "GOOD"
              ? "bg-emerald-50 text-emerald-700"
              : risk === "CAUTION"
                ? "bg-amber-50 text-amber-700"
                : "bg-red-50 text-red-700"
          }`}
        >
          {RISK_COPY[risk].label}
        </span>
      )}
    </>
  );

  const className =
    "flex items-center justify-between gap-4 rounded-2xl border border-gray-light bg-white p-4 sm:p-5";

  if (!record.record_uuid) {
    return <li className={className}>{content}</li>;
  }

  return (
    <li>
      <Link
        href={`/records/${record.record_uuid}`}
        className={`${className} transition-colors hover:border-primary/40`}
      >
        {content}
      </Link>
    </li>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-8 text-center">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600">
        {description}
      </p>
      <div className="mt-6 flex justify-center">
        <RecordButton />
      </div>
    </div>
  );
}
