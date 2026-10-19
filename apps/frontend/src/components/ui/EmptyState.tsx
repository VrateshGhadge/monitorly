import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

const defaultIcon = (
  <svg
    width="26"
    height="26"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
  </svg>
);

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-5 py-14 text-center">
      <div className="mb-2 grid size-[52px] place-items-center rounded-xl border border-line bg-[var(--tile-bg)] text-brand">
        {icon ?? defaultIcon}
      </div>
      <h4 className="m-0 text-[15px]">{title}</h4>
      {description && (
        <p className="m-0 max-w-[320px] text-[13px] text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
