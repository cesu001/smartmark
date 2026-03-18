import type { Metadata } from "next";
import DashboardShellLoader from "@/components/dashboard/DashboardShellLoader";

export const metadata: Metadata = {
  title: "SmartMark — Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShellLoader>{children}</DashboardShellLoader>;
}
