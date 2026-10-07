import { cookies } from "next/headers";
import { ADMIN_AUTH_COOKIE } from "@/proxy";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
  return Response.json({ ok: true });
}
