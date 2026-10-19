import { cn } from "../../lib/utils";

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
      className={cn(
        "inline-block animate-skeleton bg-[linear-gradient(90deg,#171b21_25%,#1f242c_37%,#171b21_63%)] [background-size:400%_100%]",
        className,
      )}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[9px] border border-line bg-panel p-4">
      <Skeleton width={90} height={11} />
      <Skeleton width={70} height={26} className="mt-2.5 block" />
      <Skeleton width={110} height={11} className="mt-2.5 block" />
    </div>
  );
}

export function TableRowSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <div className="grid grid-cols-[90px_1.4fr_1.6fr_0.8fr_0.9fr_0.7fr_90px] items-center gap-2.5 border-b border-[#1b2027] px-4 py-[13px] text-[13px] [transition:0.12s] last:border-b-0 hover:bg-[#141920] light:border-[#edeef1] light:hover:bg-[#f7f8f9] [@media(max-width:720px)]:relative [@media(max-width:720px)]:grid-cols-1 [@media(max-width:720px)]:gap-1.5 [@media(max-width:720px)]:px-4 [@media(max-width:720px)]:py-3.5" aria-hidden="true">
      {Array.from({ length: columns }).map((_, i) => (
        <div className="min-w-0 text-[#c9cdd3] [&>b]:block [&>b]:text-[13px] [&>b]:font-semibold" key={i}>
          <Skeleton height={12} width={i === 0 ? 90 : "70%"} />
        </div>
      ))}
    </div>
  );
}
