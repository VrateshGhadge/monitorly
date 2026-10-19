import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

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
    <div className="rounded-[9px] border border-line bg-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <label className="text-[11px] text-[#818994]">{label}</label>
        {icon && <span className="text-brand">{icon}</span>}
      </div>
      <strong
        className={cn(
          "block text-[23px] tracking-[-0.7px]",
          tone === "bad" && "text-[#ff9d9d]",
        )}
      >
        {value}
        {unit && (
          <small className="ml-[3px] text-[12px] font-normal text-muted">
            {unit}
          </small>
        )}
      </strong>
      {trend && (
        <span
          className={cn(
            "mt-2 block text-[11px] text-muted",
            trend.direction === "up" && "text-brand",
            trend.direction === "down" && "text-[#ff9d9d]",
          )}
        >
          {trend.direction === "up" && "↑"}
          {trend.direction === "down" && "↓"}
          {trend.direction === "flat" && "→"} {trend.label}
        </span>
      )}
    </div>
  );
}
