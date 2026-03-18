import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SmartMark — Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Top Bar */}
      <header className="flex items-center gap-3 px-4 h-12 shrink-0 border-b border-border bg-surface">
        {/* Search */}
        <div className="flex-1 max-w-xl">
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
            <span className="text-sm text-text-secondary">
              Search notes...
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm text-text-secondary border border-border hover:bg-surface-hover transition-colors">
            <svg
              className="w-3.5 h-3.5"
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
            Import
          </button>
          <button className="flex items-center gap-1.5 px-3 h-8 rounded-md text-sm text-white bg-accent hover:opacity-90 transition-opacity font-medium">
            <svg
              className="w-3.5 h-3.5"
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
            New Note
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
