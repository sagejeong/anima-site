import HeaderClient from "@/components/HeaderClient";
import { readDisplayUserId } from "@/lib/anima-api";

/**
 * 서버 컴포넌트: 쿠키에서 로그인(계정 연결) 상태만 읽어 클라이언트 컴포넌트에 넘깁니다.
 * 스크롤·모바일 메뉴 같은 상호작용은 HeaderClient가 담당합니다.
 */
export default async function Header() {
  const userId = await readDisplayUserId();
  return <HeaderClient userId={userId} />;
}
