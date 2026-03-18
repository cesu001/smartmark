'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex items-center h-12 shrink-0 border-b border-border bg-surface">
          {/* Logo — fixed w-60 on desktop to match sidebar */}
          <div className="flex items-center justify-between shrink-0 px-4 w-auto md:w-60">
            <span className="text-sm font-semibold text-text-primary">SmartMark</span>

            {/* Sidebar toggle — desktop only, inside logo section */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:block p-1 rounded hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
              aria-label="Toggle sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sidebar toggle — mobile only, between logo and search */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1 mx-2 rounded hover:bg-surface-hover text-text-secondary transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Divider */}
          <div className="hidden md:block w-px h-full bg-border shrink-0" />

          {/* Search + Actions */}
          <div className="flex items-center gap-3 flex-1 px-4">
          <div className="flex-1 md:max-w-sm">
            <div className="flex items-center gap-2 px-3 h-8 rounded-md bg-background border border-border">
              <svg
                className="w-3.5 h-3.5 text-text-secondary shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <span className="text-sm text-text-secondary">Search notes...</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm text-text-secondary border border-border hover:bg-surface-hover transition-colors">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-8-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="hidden md:inline">Import</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm text-white bg-accent hover:opacity-90 transition-opacity font-medium">
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden md:inline">New Note</span>
            </button>
          </div>
          </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
