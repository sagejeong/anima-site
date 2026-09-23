import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import RecordButton from "@/components/RecordButton";
import AppDownloadCta from "@/components/record/AppDownloadCta";
import ResultBody from "@/components/record/ResultBody";
import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";
import {
  pickRecordDate,
  type MRRecordSummary,
  type RecordsListResponse,
} from "@/lib/result";

export const metadata: Metadata = {
  title: "기록 상세 · ANiMA",
};

type RecordDetailPageProps = {
  params: Promise<{ recordUuid: string }>;
};

export default async function RecordDetailPage({
  params,
}: RecordDetailPageProps) {
  const { recordUuid } = await params;
  const userUuid = await readUserUuid();

  // 서버에 "id로 한 건 조회" API가 따로 없어, 목록을 받아 그 안에서 찾습니다.
  const result = userUuid
    ? await callAnimaApi<RecordsListResponse>(
        animaUrl("/records", { user_uuid: userUuid }),
      )
    : null;

  const record: MRRecordSummary | undefined = result?.ok
    ? result.data.records?.find((item) => item.record_uuid === recordUuid)
    : undefined;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-cream">
      <Header />

      <main className="flex flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 pb-20 pt-28 sm:px-8 sm:pt-36">
          <Link
            href="/records"
            className="self-start text-sm font-medium text-ink-soft underline underline-offset-4 hover:text-primary"
          >
            ← 내 기록으로
          </Link>

          <h1 className="mt-6 text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            분석 결과
          </h1>

          <div className="mt-12 flex flex-col items-center gap-6">
            {!record ? (
              <div className="w-full max-w-md rounded-2xl border border-gray-light bg-steel-surface p-8 text-center">
                <h2 className="text-lg font-bold text-ink">
                  기록을 찾을 수 없어요
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  삭제되었거나 이 브라우저의 기록이 아닐 수 있습니다.
                </p>
                <div className="mt-6 flex justify-center">
                  <RecordButton />
                </div>
              </div>
            ) : (
              <>
                <ResultBody
                  isCough={record.final_label === "NO_COUGH" ? false : undefined}
                  distance={record.healthy_distance}
                  failReason={record.quality_fail_reason}
                  measuredAt={pickRecordDate(record)}
                  medicationTaken={Boolean(record.medication_taken)}
                />

                {/* 지난 기록에는 방금 녹음한 소리가 남아있지 않아 재생 기능은 없습니다. */}
                <AppDownloadCta />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
