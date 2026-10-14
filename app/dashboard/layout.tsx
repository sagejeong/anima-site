import type { Metadata } from "next";
import AppShell from "@/components/hub/AppShell";

export const metadata: Metadata = {
  title: "대시보드 · ANiMA",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
