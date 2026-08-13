import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  trailing?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, trailing, id, className, ...rest }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="mb-4 flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#c9cdd3]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-md border bg-[#0d1014] px-3 text-sm text-foreground outline-none transition placeholder:text-[#5b6169] focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-[#0b0e12] disabled:text-[#9aa2ac]",

              trailing && "pr-10",

              error && "border-danger focus:border-danger focus:ring-danger/15",

              className,
            )}
            {...rest}
          />

          {trailing && (
            <div className="absolute right-1.5 flex items-center">
              {trailing}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-300">{error}</p>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

// import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
// import { cn } from "../../lib/utils";

// interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; trailing?: ReactNode; }

// const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, trailing, id, className, ...rest }, ref) => {
//   const generatedId = useId();
//   const inputId = id || generatedId;
//   return <div className="mb-4 flex flex-col gap-1.5">
//     {label && <label className="text-xs font-semibold text-[#c9cdd3]" htmlFor={inputId}>{label}</label>}
//     <div className="relative flex items-center"><input ref={ref} id={inputId} className={cn("h-10 w-full rounded-md border bg-[#0d1014] px-3 text-sm text-foreground outline-none transition placeholder:text-[#5b6169] focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:cursor-not-allowed disabled:bg-[#0b0e12] disabled:text-[#9aa2ac]", trailing && "pr-10", error && "border-danger focus:border-danger focus:ring-danger/15", className)} {...rest} />{trailing && <div className="absolute right-1.5 flex items-center">{trailing}</div>}</div>
//     {error ? <p className="text-xs text-red-300">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
//   </div>;
// });
// Input.displayName = "Input";
// export default Input;
