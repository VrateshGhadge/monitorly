import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  unit?: string;
  trend?: { direction: "up" | "down" | "flat"; label: string };
  tone?: "default" | "bad";
  icon?: ReactNode;
}

export default function StatCard({
  label,
  value,
  unit,
  trend,
  tone = "default",
  icon,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <label>{label}</label>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <strong className={tone === "bad" ? "stat-bad" : ""}>
        {value}
        {unit && <small>{unit}</small>}
      </strong>
      {trend && (
        <span className={`stat-trend stat-trend-${trend.direction}`}>
          {trend.direction === "up" && "↑"}
          {trend.direction === "down" && "↓"}
          {trend.direction === "flat" && "→"} {trend.label}
        </span>
      )}
    </div>
  );
}
