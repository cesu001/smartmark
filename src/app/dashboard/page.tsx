export default function DashboardPage() {
  return (
    <>
      {/* Left Sidebar */}
      <aside className="w-60 shrink-0 border-r border-border bg-surface p-4">
        <h2 className="text-text-secondary text-sm font-medium">
          Sidebar
        </h2>
      </aside>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-text-secondary text-sm font-medium">
          Main
        </h2>
      </main>
    </>
  );
}
