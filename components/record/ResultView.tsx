"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import RecordButton from "@/components/RecordButton";
import AppDownloadCta from "@/components/record/AppDownloadCta";
import ResultBody from "@/components/record/ResultBody";
import { LAST_RESULT_STORAGE_KEY, type StoredResult } from "@/lib/result";

/** sessionStorage는 서버에 없어 서버 렌더링과 어긋나지 않게 읽습니다. */
const subscribeToNothing = () => () => undefined;

function readStoredResult(): string | null {
  return sessionStorage.getItem(LAST_RESULT_STORAGE_KEY);
}

export default function ResultView() {
  const storedRaw = useSyncExternalStore(
    subscribeToNothing,
    readStoredResult,
    () => null, // 서버에서는 아직 아무것도 없다고 봅니다
  );

  const stored = useMemo<StoredResult | null>(() => {
    if (!storedRaw) return null;
    try {
      const parsed: unknown = JSON.parse(storedRaw);
      // 저장 형식이 바뀌기 전(예전 세션)에 쓰인 데이터가 남아있을 수 있어,
      // 지금 기대하는 모양인지 확인한 뒤에만 씁니다. 아니면 "결과 없음"으로 취급합니다.
      if (
        parsed &&
        typeof parsed === "object" &&
        "response" in parsed &&
        "measuredAt" in parsed
      ) {
        return parsed as StoredResult;
      }
      return null;
    } catch {
      return null;
    }
  }, [storedRaw]);

  if (!stored) {
    return (
      <div className="rounded-2xl border border-gray-light bg-steel-surface p-8 text-center">
        <h2 className="text-lg font-bold text-ink">
          아직 확인할 결과가 없어요
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          기침을 녹음하고 분석을 요청하면 여기에 결과가 나타납니다.
        </p>
        <div className="mt-6 flex justify-center">
          <RecordButton />
        </div>
      </div>
    );
  }

  const { response, measuredAt, audioDataUrl, medication } = stored;
  const hasDistance = typeof response.prediction?.stage2?.distance === "number";

  return (
    <div className="flex flex-col items-center gap-6">
      <ResultBody
        isCough={response.prediction?.is_cough}
        distance={response.prediction?.stage2?.distance}
        failReason={response.quality?.quality_fail_reason}
        message={response.final_prediction?.final_message}
        measuredAt={measuredAt}
        audioUrl={audioDataUrl}
        medicationTaken={medication?.taken}
      />

      {hasDistance && (
        <Link
          href="/records"
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          평균 기침 추이 보기
        </Link>
      )}

      <AppDownloadCta />
    </div>
  );
}
