import type { Metadata } from "next";
import { cookies } from "next/headers";
import AppShell from "@/components/hub/AppShell";
import { ADMIN_AUTH_COOKIE, getAdminPassword } from "@/proxy";

export const metadata: Metadata = {
  title: "대시보드 · ANiMA",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get(ADMIN_AUTH_COOKIE)?.value === getAdminPassword();

  return <AppShell isAdmin={isAdmin}>{children}</AppShell>;
}
