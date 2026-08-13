interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  className?: string;
}

export function Skeleton({
  width = "100%",
  height = 14,
  radius = 6,
  className = "",
}: SkeletonProps) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <Skeleton width={90} height={11} />
      <Skeleton width={70} height={26} className="skeleton-gap" />
      <Skeleton width={110} height={11} className="skeleton-gap" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="table-row" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <div className="table-cell" key={i}>
          <Skeleton height={12} width={i === 0 ? 90 : "70%"} />
        </div>
      ))}
    </div>
  );
}
