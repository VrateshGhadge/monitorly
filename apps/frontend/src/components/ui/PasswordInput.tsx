import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, type InputHTMLAttributes } from "react";

import Input from "./Input";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, hint, ...rest }, ref) => {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        hint={hint}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            className="rounded p-1.5 text-[#7c828c] hover:text-[#c5cad1]"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        }
        {...rest}
      />
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;

// import { Eye, EyeOff } from "lucide-react";
// import { forwardRef, useState, type InputHTMLAttributes } from "react";
// import Input from "./Input";

// interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; hint?: string; }
// const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ label, error, hint, ...rest }, ref) => {
//   const [visible, setVisible] = useState(false);
//   return <Input ref={ref} label={label} error={error} hint={hint} type={visible ? "text" : "password"} trailing={<button type="button" className="rounded p-1.5 text-[#7c828c] hover:text-[#c5cad1]" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} tabIndex={-1}>{visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>} {...rest} />;
// });
// PasswordInput.displayName = "PasswordInput";
// export default PasswordInput;
