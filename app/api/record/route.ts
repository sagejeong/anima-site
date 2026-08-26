import { animaUrl, callAnimaApi, readUserUuid } from "@/lib/anima-api";

/** 브라우저가 보낼 수 있는 최대 녹음 파일 크기 */
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * 녹음 파일을 ANiMA 서버의 POST /upload 로 중계합니다.
 *
 * 브라우저는 user_uuid를 모릅니다(httpOnly 쿠키라 읽을 수 없음).
 * 여기서 쿠키를 읽어 대신 붙여 보냅니다.
 */
export async function POST(request: Request) {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json(
      { error: "방문자 정보가 없습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요." },
      { status: 400 },
    );
  }

  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return Response.json(
      { error: "녹음 파일을 읽지 못했습니다." },
      { status: 400 },
    );
  }

  const file = incoming.get("file");
  if (!(file instanceof File)) {
    return Response.json(
      { error: "녹음 파일이 포함되지 않았습니다." },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return Response.json({ error: "녹음 파일이 비어 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json(
      { error: "녹음 파일이 너무 큽니다." },
      { status: 413 },
    );
  }

  const outgoing = new FormData();
  outgoing.append("file", file, file.name);
  outgoing.append("user_uuid", userUuid);

  // MRRecord의 medication_* 컬럼에 대응합니다. 서버가 아직 이 필드를 받지
  // 않는다면 FastAPI가 조용히 무시하므로, 미리 보내둬도 안전합니다.
  for (const field of ["medication_taken", "medication_category", "medication_name"]) {
    const value = incoming.get(field);
    if (typeof value === "string") {
      outgoing.append(field, value);
    }
  }

  const result = await callAnimaApi<unknown>(animaUrl("/upload"), {
    method: "POST",
    body: outgoing,
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json(result.data);
}
