interface StatsCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

export default function StatsCard({ label, value, icon }: StatsCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-surface border border-border">
      <div className="flex items-center justify-center w-10 h-10 rounded-md bg-surface-hover text-text-secondary shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-text-primary">{value}</p>
        <p className="text-xs text-text-secondary">{label}</p>
      </div>
    </div>
  );
}
