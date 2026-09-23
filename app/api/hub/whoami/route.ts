import { readUserUuid } from "@/lib/anima-api";
import { findWorkerByUuid } from "@/lib/hub-roster";

// 이 폰(쿠키)이 이미 등록된 입소자인지 확인, /checkin 이름 입력 건너뛸지 판단용
export async function GET() {
  const userUuid = await readUserUuid();
  if (!userUuid) {
    return Response.json({ worker: null });
  }
  return Response.json({ worker: findWorkerByUuid(userUuid) });
}
