import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    // `max-[720px]:` compiles to `not all and (min-width:720px)`, which
    // excludes exactly 720px, whereas the CSS it replaces used the inclusive
    // `@media (max-width: 720px)`. The raw variant keeps that boundary.
    <div className="mb-[26px] flex flex-wrap items-end justify-between gap-5 [@media(max-width:720px)]:items-start">
      <div>
        {eyebrow && (
          <div className="mb-2 font-code text-[11px] leading-[normal] tracking-[0.08em] text-brand uppercase">
            {eyebrow}
          </div>
        )}
        <h1 className="m-0 text-[26px] tracking-[-0.9px]">{title}</h1>
        {description && (
          <p className="mt-2 mb-0 max-w-[520px] text-[13.5px] text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2.5">{actions}</div>}
    </div>
  );
}
