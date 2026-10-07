"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, ChartIcon, GearIcon, GridIcon, MenuIcon, PeopleIcon, PulseIcon } from "@/components/hub/icons";

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: "전체 현황", href: "/dashboard", icon: GridIcon },
  { label: "실시간 연동", href: "/dashboard/live", icon: PulseIcon },
  { label: "입소자 관리", href: "/dashboard/workers", icon: PeopleIcon },
  { label: "알림 이력", href: "/dashboard/alerts", icon: BellIcon },
  { label: "보고서", href: "/dashboard/reports", icon: ChartIcon },
  { label: "설정", href: "/dashboard/settings", icon: GearIcon },
] as const;

type AppShellProps = {
  children: React.ReactNode;
};

// 대시보드 레이아웃(사이드바 + 본문). 로그인 붙기 전이라 화면 틀만 있음
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const isLivePage = pathname.startsWith("/dashboard/live");

  const isActive = (href: string): boolean =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex min-h-screen bg-steel font-hub-body text-ink">
      {/* 데스크탑 사이드바 */}
      <aside className="hidden w-64 shrink-0 flex-col bg-charcoal px-5 py-6 lg:flex">
        <SidebarContent isActive={isActive} />
      </aside>

      {/* 모바일 슬라이드오버 */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="relative flex h-full w-64 flex-col bg-charcoal px-5 py-6">
            <SidebarContent isActive={isActive} onNavigate={() => setIsMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-steel-surface px-5 sm:px-8">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink lg:hidden"
            aria-label="메뉴 열기"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <span className="hidden text-sm font-semibold text-ink-soft lg:block">
            {isLivePage
              ? "앱에서 실제로 녹음한 결과가 그대로 반영되는 화면입니다"
              : "예시 데이터로 동작 방식을 보여주는 데모 화면입니다"}
          </span>

          {isLivePage ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-good/10 px-3 py-1.5 text-xs font-bold text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              DEMO
            </span>
          )}
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  isActive,
  onNavigate,
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-1" onClick={onNavigate}>
        <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto sm:h-7" />
      </Link>

      <nav className="mt-10 flex flex-col gap-1" aria-label="대시보드 메뉴">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-white"
                  : "text-ink/70 hover:bg-primary/10 hover:text-ink"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
          관
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">관리자 계정</p>
          <p className="truncate text-xs text-ink/50">demo@anima.hub</p>
        </div>
      </div>
    </>
  );
}
