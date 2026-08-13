import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

type BadgeTone = "green" | "red" | "yellow" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  dot?: boolean;
}

export default function Badge({
  tone = "neutral",
  children,
  dot = true,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[11px] uppercase tracking-wide",

        tone === "green" && "border-[#254d3a] bg-brand/5 text-brand",

        tone === "red" && "border-[#5c2c2c] bg-danger/5 text-red-300",

        tone === "yellow" && "border-[#5c4a25] bg-yellow-300/5 text-yellow-300",

        tone === "neutral" && "border-border text-muted-foreground",
      )}
    >
      {dot && (
        <i
          className={cn(
            "size-1.5 rounded-full",

            tone === "green" && "bg-brand",

            tone === "red" && "bg-danger",

            tone === "yellow" && "bg-yellow-300",

            tone === "neutral" && "bg-muted-foreground",
          )}
        />
      )}

      {children}
    </span>
  );
}

// import type { ReactNode } from "react";
// import { cn } from "../../lib/utils";

// type BadgeTone = "green" | "red" | "yellow" | "neutral";

// interface BadgeProps {
//   tone?: BadgeTone;
//   children: ReactNode;
//   dot?: boolean;
// }

// export default function Badge({ tone = "neutral", children, dot = true }: BadgeProps) {
//   return (
//     <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-1 font-mono text-[11px] uppercase tracking-wide", tone === "green" && "border-[#254d3a] bg-brand/5 text-brand", tone === "red" && "border-[#5c2c2c] bg-danger/5 text-red-300", tone === "yellow" && "border-[#5c4a25] bg-yellow-300/5 text-yellow-300", tone === "neutral" && "border-border text-muted-foreground")}>
//       {dot && <i className={cn("size-1.5 rounded-full", tone === "green" && "bg-brand", tone === "red" && "bg-danger", tone === "yellow" && "bg-yellow-300", tone === "neutral" && "bg-muted-foreground")} />}
//       {children}
//     </span>
//   );
// }
