import { removeWorker } from "@/lib/hub-roster";

// 입소자 한 명 삭제. 체크인 기록도 같이 지워짐
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const removed = removeWorker(id);
  if (!removed) {
    return Response.json({ error: "해당 입소자를 찾지 못했습니다." }, { status: 404 });
  }
  return Response.json({ ok: true });
}
