'use client';

import dynamic from 'next/dynamic';

const DashboardShell = dynamic(() => import('./DashboardShell'), { ssr: false });

export default function DashboardShellLoader({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
