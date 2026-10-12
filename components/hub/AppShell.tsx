"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BellIcon, ChartIcon, GearIcon, GridIcon, PeopleIcon, PulseIcon } from "@/components/hub/icons";

/**
 * 대시보드는 표·실시간 목록 위주로 PC 화면 기준으로 설계돼 있어서, 작은
 * 화면에서는 억지로 욱여넣는 대신 안내만 보여줌. children(각 페이지)을
 * 아예 마운트 안 해서, 휴대폰에서 폴링 같은 불필요한 요청도 안 나가게 함.
 */
function useIsNarrowScreen(): boolean | null {
  const [isNarrow, setIsNarrow] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsNarrow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isNarrow;
}

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

// 대시보드 레이아웃(사이드바 + 본문). 공용 비밀번호 로그인(proxy.ts)으로 /dashboard/* 전체가 막혀 있음
export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const isNarrowScreen = useIsNarrowScreen();
  // 전체 현황(개요)만 발표용 예시 데이터로 남겨두고, 나머지 전부는 실제 데이터 화면
  const isOverview = pathname === "/dashboard";

  const isActive = (href: string): boolean =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  if (isNarrowScreen === null) {
    // 화면 폭을 아직 확인 전. 깜빡임 없이 그냥 비워둠(아주 잠깐)
    return <div className="min-h-screen bg-steel" />;
  }

  if (isNarrowScreen) {
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

  return (
    <div className="flex min-h-screen bg-steel font-hub-body text-ink">
      {/* PC에서만 이 컴포넌트가 렌더되므로 사이드바는 항상 보임 */}
      <aside className="flex w-64 shrink-0 flex-col bg-charcoal px-5 py-6">
        <SidebarContent isActive={isActive} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-line bg-steel-surface px-5 sm:px-8">
          <span className="text-sm font-semibold text-ink-soft">
            {isOverview
              ? "예시 데이터로 동작 방식을 보여주는 데모 화면입니다"
              : "실제 등록된 입소자의 데이터만 보여주는 화면입니다"}
          </span>

          {isOverview ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
              DEMO
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-good/10 px-3 py-1.5 text-xs font-bold text-good">
              <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              LIVE
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

      <LogoutButton />
    </>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleLogout()}
      disabled={isLoggingOut}
      className="mt-auto flex items-center gap-3 rounded-xl bg-primary/5 px-3 py-3 text-left transition-colors hover:bg-primary/10 disabled:opacity-60"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
        관
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">관리자</p>
        <p className="truncate text-xs text-ink/50">{isLoggingOut ? "로그아웃 중..." : "로그아웃"}</p>
      </div>
    </button>
  );
}
