"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, ChartIcon, GearIcon, GridIcon, HomeIcon, PeopleIcon } from "@/components/hub/icons";

type ScreenMode = "blocked" | "compact" | "full";

/**
 * 대시보드는 표·실시간 목록이 많아 폰 폭(640 미만)에서는 안내만 보여줌. 640~1023은
 * 노트북 창을 꽉 안 채웠을 때 흔히 걸리는 구간이라 막지 않고, 사이드바를 아이콘만
 * 남는 좁은 폭으로 줄여서 본문 공간을 확보함(compact). children을 블록 상태에서는
 * 아예 마운트 안 해서, 휴대폰에서 폴링 같은 불필요한 요청도 안 나가게 함.
 */
function useScreenMode(): ScreenMode | null {
  const [mode, setMode] = useState<ScreenMode | null>(null);

  useEffect(() => {
    const blockedQuery = window.matchMedia("(max-width: 639px)");
    const compactQuery = window.matchMedia("(min-width: 640px) and (max-width: 1023px)");

    const update = () => {
      if (blockedQuery.matches) setMode("blocked");
      else if (compactQuery.matches) setMode("compact");
      else setMode("full");
    };

    update();
    blockedQuery.addEventListener("change", update);
    compactQuery.addEventListener("change", update);
    return () => {
      blockedQuery.removeEventListener("change", update);
      compactQuery.removeEventListener("change", update);
    };
  }, []);

  return mode;
}

type NavItem = {
  label: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const NAV_ITEMS: readonly NavItem[] = [
  { label: "전체현황", href: "/dashboard", icon: GridIcon },
  { label: "입소자 관리", href: "/dashboard/workers", icon: PeopleIcon },
  { label: "알림 이력", href: "/dashboard/alerts", icon: BellIcon },
  { label: "보고서", href: "/dashboard/reports", icon: ChartIcon },
  { label: "설정", href: "/dashboard/settings", icon: GearIcon },
] as const;

type AppShellProps = {
  children: React.ReactNode;
};

// 대시보드 레이아웃(사이드바 + 본문). 공용 비밀번호 로그인(proxy.ts)으로 /dashboard/* 전체가 막혀 있음
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const mode = useScreenMode();

  const isActive = (href: string): boolean =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  if (mode === null) {
    // 화면 폭을 아직 확인 전. 깜빡임 없이 그냥 비워둠(아주 잠깐)
    return <div className="min-h-screen bg-steel" />;
  }

  if (mode === "blocked") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-steel px-6 text-center font-hub-body">
        <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-7 w-auto" />
        <p className="font-hub-display text-xl font-black text-ink">
          이 화면은 PC에서 이용해 주세요
        </p>
        <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
          대시보드는 표와 실시간 목록이 많아 넓은 화면에 맞춰 설계했어요. 노트북이나
          데스크톱에서 다시 열어주시면 정상적으로 보여요.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-accent"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const isCompact = mode === "compact";

  return (
    <div className="flex min-h-screen bg-steel font-hub-body text-ink">
      {/* compact(640~1023)는 아이콘만 남는 좁은 레일로, 본문에 공간을 더 줌 */}
      <aside className={`flex shrink-0 flex-col bg-charcoal py-6 ${isCompact ? "w-16 items-center px-2" : "w-64 px-5"}`}>
        <SidebarContent isActive={isActive} compact={isCompact} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-3 border-b border-line bg-steel-surface px-5 sm:px-8">
          <span className="hidden truncate text-sm font-semibold text-ink-soft md:inline">
            실제 등록된 입소자의 데이터만 보여주는 화면입니다
          </span>

          <span className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-good/10 px-3 py-1.5 text-xs font-bold text-good">
            <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
            LIVE
          </span>
        </header>

        <main className="flex-1 overflow-x-auto px-5 py-8 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  isActive,
  onNavigate,
  compact = false,
}: {
  isActive: (href: string) => boolean;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  return (
    <>
      <Link href="/" className="flex items-center gap-2.5 px-1" onClick={onNavigate} aria-label="ANiMA 홈으로">
        {compact ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
            A
          </span>
        ) : (
          <Image src="/anima_hub_logo.png" alt="ANiMA" width={645} height={119} className="h-6 w-auto sm:h-7" />
        )}
      </Link>

      <nav className={`mt-8 flex flex-col gap-1 ${compact ? "items-center" : ""}`} aria-label="대시보드 메뉴">
        <Link
          href="/"
          onClick={onNavigate}
          title="홈으로"
          className={`flex items-center gap-3 rounded-xl text-sm font-semibold text-ink/70 transition-colors hover:bg-primary/10 hover:text-ink ${
            compact ? "justify-center p-2.5" : "px-3 py-2.5"
          }`}
        >
          <HomeIcon className="h-4.5 w-4.5 shrink-0" />
          {!compact && "홈으로"}
        </Link>
        <div className={`my-2 border-t border-white/10 ${compact ? "w-8" : ""}`} />

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
              className={`flex items-center gap-3 rounded-xl text-sm font-semibold transition-colors ${
                compact ? "justify-center p-2.5" : "px-3 py-2.5"
              } ${active ? "bg-primary text-white" : "text-ink/70 hover:bg-primary/10 hover:text-ink"}`}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {!compact && item.label}
            </Link>
          );
        })}
      </nav>

      <LogoutButton compact={compact} />
    </>
  );
}

function LogoutButton({ compact = false }: { compact?: boolean }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      // router.push 대신 완전히 새로 불러오기: 안 그러면 /dashboard-start 같은
      // 페이지가 로그아웃 전 "관리자였음" 상태를 브라우저 캐시에서 그대로 보여줌
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/admin/login";
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      title={isLoggingOut ? "로그아웃 중..." : "로그아웃"}
      className={`mt-auto flex items-center gap-3 rounded-xl bg-primary/5 text-left transition-colors hover:bg-primary/10 disabled:opacity-60 ${
        compact ? "justify-center p-2" : "px-3 py-3"
      }`}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        관
      </span>
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">관리자</p>
          <p className="truncate text-xs text-ink/50">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</p>
        </div>
      )}
    </button>
  );
}
