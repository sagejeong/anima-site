import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";
import { addCheckin, findWorkerByUuid, type CheckinSession, type CheckinStatus } from "@/lib/hub-roster";
import { RISK_COPY, classifyRisk, toDisplayPercent, type AnimaUploadResponse } from "@/lib/result";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

// 입소자 오전/오후 기침을 실제 FastAPI로 분석 요청하고 결과 저장.
// 기존 /api/record랑 같은 방식으로 FastAPI POST /upload 그대로 씀
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json(
      { error: "방문자 정보가 없습니다. 새로고침 후 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  const worker = findWorkerByUuid(userUuid);
  if (!worker) {
    return Response.json({ error: "먼저 이름을 등록해 주세요." }, { status: 400 });
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return Response.json({ error: "녹음 파일을 읽지 못했습니다." }, { status: 400 });
  }

  const file = incoming.get("file");
  const session = incoming.get("session");

  if (!(file instanceof File)) {
    return Response.json({ error: "녹음 파일이 포함되지 않았습니다." }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ error: "녹음 파일이 비어 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "녹음 파일이 너무 큽니다." }, { status: 413 });
  }
  if (session !== "before" && session !== "after") {
    return Response.json({ error: "오전/오후 구분이 필요합니다." }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file, file.name);
  outgoing.append("user_uuid", userUuid);

  const result = await callAnimaApi<AnimaUploadResponse>(animaUrl("/upload"), {
    method: "POST",
    body: outgoing,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  const analysis = result.data;
  const isCough = analysis.prediction?.is_cough;
  const distance = analysis.prediction?.stage2?.distance;
  const failReason = analysis.quality?.quality_fail_reason ?? null;
  const hasValidResult = isCough !== false && !failReason && typeof distance === "number";

  const checkin = addCheckin({
    workerId: worker.id,
    session: session as CheckinSession,
    measuredAt: new Date().toISOString(),
    isCough: isCough !== false,
    percent: hasValidResult ? Math.round(toDisplayPercent(distance as number)) : null,
    status: hasValidResult ? (RISK_COPY[classifyRisk(distance as number)].label as CheckinStatus) : null,
    failReason: hasValidResult ? null : failReason ?? "NO_COUGH",
    sourceRecordUuid: null,
  });

  return Response.json({ checkin, analysis });
}
