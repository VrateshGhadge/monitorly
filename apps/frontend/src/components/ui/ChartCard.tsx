import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  meta?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  meta,
  action,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`chart-card ${className}`}>
      <div className="chart-card-head">
        <h4>{title}</h4>
        <div className="chart-card-meta">
          {meta && <small>{meta}</small>}
          {action}
        </div>
      </div>
      {children}
    </div>
  );
}
