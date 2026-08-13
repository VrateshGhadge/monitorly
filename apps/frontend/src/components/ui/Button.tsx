import { cva, type VariantProps } from "class-variance-authority";
import { LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#e9edf0] text-[#111] hover:bg-white",

        outline:
          "border border-border bg-surface-raised text-[#dce0e5] hover:border-[#3a4048] hover:text-white",

        ghost: "text-[#c5cad1] hover:text-white",

        danger:
          "border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20",
      },

      size: {
        md: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
      },

      fullWidth: {
        true: "w-full",
        false: "",
      },
    },

    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
  },
);

interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant,
  size,
  loading = false,
  icon,
  fullWidth,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        buttonVariants({
          variant,
          size,
          fullWidth,
        }),
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : icon}

      <span>{children}</span>
    </button>
  );
}

// import { cva, type VariantProps } from "class-variance-authority";
// import { LoaderCircle } from "lucide-react";
// import type { ButtonHTMLAttributes, ReactNode } from "react";
// import { cn } from "../../lib/utils";

// const buttonVariants = cva(
//   "inline-flex items-center justify-center gap-2 rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50",
//   { variants: { variant: { primary: "bg-[#e9edf0] text-[#111] hover:bg-white", outline: "border border-border bg-surface-raised text-[#dce0e5] hover:border-[#3a4048] hover:text-white", ghost: "text-[#c5cad1] hover:text-white", danger: "border border-red-400/30 bg-red-400/10 text-red-300 hover:bg-red-400/20" }, size: { md: "h-10 px-4", sm: "h-8 px-3 text-xs" }, fullWidth: { true: "w-full", false: "" } },
//     defaultVariants: { variant: "primary", size: "md", fullWidth: false },
//   }
// );

// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { loading?: boolean; icon?: ReactNode; }

// export default function Button({ variant, size, loading = false, icon, fullWidth, className, children, disabled, ...rest }: ButtonProps) {
//   return <button className={cn(buttonVariants({ variant, size, fullWidth }), className)} disabled={disabled || loading} {...rest}>{loading ? <LoaderCircle className="size-4 animate-spin" /> : icon}<span>{children}</span></button>;
// }
