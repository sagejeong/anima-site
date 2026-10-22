import { cookies } from "next/headers";
import HeaderClient from "@/components/HeaderClient";
import { readDisplayUserId } from "@/lib/anima-api";
import { ADMIN_AUTH_COOKIE, isAdminAuthCookieValid } from "@/proxy";

/**
 * 서버 컴포넌트: 쿠키에서 로그인(계정 연결) 상태만 읽어 클라이언트 컴포넌트에 넘긴다.
 * 스크롤·모바일 메뉴 같은 상호작용은 HeaderClient가 담당한다.
 * 일반 회원 로그인(userId)과 관리자 대시보드 로그인은 서로 다른 쿠키라, 둘 다 따로 읽어서
 * 넘김. 안 그러면 대시보드에서 나와 메인 페이지에 있을 때 관리자 세션을 끝낼 방법이 없음
 */
export default async function Header() {
  const userId = await readDisplayUserId();
  const cookieStore = await cookies();
  const isAdminAuthed = isAdminAuthCookieValid(cookieStore.get(ADMIN_AUTH_COOKIE)?.value);
  return <HeaderClient userId={userId} isAdminAuthed={isAdminAuthed} />;
}
