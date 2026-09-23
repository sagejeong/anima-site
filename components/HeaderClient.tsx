"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RecordButton from "@/components/RecordButton";

type NavItem = {
  label: string;
  href: string;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: "소개", href: "/about" },
  { label: "기록", href: "/records" },
  { label: "FAQ", href: "/faq" },
] as const;

/** 스크롤이 이 값을 넘으면 배경을 불투명하게 전환 */
const SCROLL_THRESHOLD = 8;

type HeaderClientProps = {
  /** 로그인(계정 연결)돼 있으면 아이디, 아니면 null. 서버 컴포넌트인 Header가 쿠키를 읽어 내려줍니다. */
  userId: string | null;
};

export default function HeaderClient({ userId }: HeaderClientProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll(); // 새로고침으로 중간부터 시작한 경우 대비
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = (): void => setIsMenuOpen(false);

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/account/logout", { method: "POST" });
    } finally {
      setIsLoggingOut(false);
      closeMenu();
      // Header는 서버 컴포넌트라 쿠키가 지워진 걸 반영하려면 다시 렌더링해야 합니다.
      router.refresh();
    }
  };

  // 메뉴가 열려 있으면 스크롤 위치와 무관하게 배경이 있어야 글씨가 읽힙니다.
  const hasBackground = isScrolled || isMenuOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        hasBackground
          ? "bg-steel-surface/80 shadow-[0_1px_16px_rgba(36,31,26,0.1)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
        {/* 좌측: 로고 + 네비게이션 */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex shrink-0 items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            onClick={closeMenu}
            aria-label="Anima 홈으로 이동"
          >
            <Image
              src="/anima_logo.png"
              alt="Anima"
              width={774}
              height={158}
              priority
              className="h-6 w-auto sm:h-7"
            />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="주요 메뉴">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink-soft transition-colors hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 중앙: 핵심 CTA, 어느 페이지에서든 바로 녹음으로 */}
        <div className="justify-self-center">
          <RecordButton size="sm" />
        </div>

        {/* 우측: 로그인 상태에 따라 아이디/로그아웃 또는 로그인·회원가입 + 모바일 햄버거 */}
        <div className="flex items-center justify-end gap-2">
          {userId ? (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/settings"
                className="rounded-full px-2 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
              >
                {userId}님
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary disabled:opacity-60"
              >
                {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
              >
                회원가입
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="-mr-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-primary/10 md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <span aria-hidden="true" className="relative block h-4 w-5">
              <span
                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                  isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 block h-0.5 w-5 -translate-y-1/2 rounded-full bg-current transition-opacity duration-200 ${
                  isMenuOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 block h-0.5 w-5 rounded-full bg-current transition-transform duration-200 ${
                  isMenuOpen ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div id="mobile-menu" className="md:hidden">
          <nav
            className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 pb-5 sm:px-8"
            aria-label="모바일 주요 메뉴"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-primary/10 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}

            <div className="mt-3 flex flex-col gap-2 border-t border-line pt-4">
              {userId ? (
                <>
                  <Link
                    href="/settings"
                    onClick={closeMenu}
                    className="rounded-lg px-3 py-2.5 text-base font-medium text-ink transition-colors hover:bg-primary/10 hover:text-primary"
                  >
                    {userId}님 · 설정
                  </Link>
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
                  >
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
