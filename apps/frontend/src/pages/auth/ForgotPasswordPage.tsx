import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import {
  forgotPasswordInput,
  type ForgotPasswordInput,
} from "@repo/validation";

import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

type Values = ForgotPasswordInput;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(forgotPasswordInput),
  });

  const submit = async ({ email }: Values) => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    setSent(email);
  };

  if (sent) {
    return (
      <AuthLayout>
        <div className="mb-[22px]">
          <h1 className="mt-0 mb-1.5 text-[24px] tracking-[-0.9px] [@media(max-width:520px)]:text-[22px]">
            Check your email
          </h1>

          <p className="m-0 text-[13.5px] text-muted">
            We've sent password reset instructions to <strong>{sent}</strong>.
          </p>
        </div>

        <Link
          className="text-[12.5px] text-[#9fe6c2] hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
          to="/signin"
        >
          ← Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-[22px]">
        <h1 className="mt-0 mb-1.5 text-[24px] tracking-[-0.9px] [@media(max-width:520px)]:text-[22px]">
          Reset your password
        </h1>

        <p className="m-0 text-[13.5px] text-muted">
          Enter the email associated with your account and we'll send a reset
          link.
        </p>
      </div>

      <form className="flex flex-col" onSubmit={handleSubmit(submit)} noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button type="submit" fullWidth loading={isSubmitting}>
          Send reset link
        </Button>
      </form>

      <p className="mt-[18px] mb-0 text-center text-[13px] text-muted">
        <Link className="font-semibold text-brand" to="/signin">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { Link } from "react-router-dom";

// import AuthLayout from "../../components/auth/AuthLayout";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import { forgotPasswordInput, type ForgotPasswordInput } from "@repo/validation";

// type Values = ForgotPasswordInput;

// export default function ForgotPasswordPage() { const [sent, setSent] = useState<string>(); const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(forgotPasswordInput) }); const submit = async ({ email }: Values) => { await new Promise((resolve) => setTimeout(resolve, 600)); setSent(email); };
//   if (sent) return <AuthLayout><div className="auth-head"><h1>Check your email</h1><p>We've sent password reset instructions to {sent}.</p></div><Link className="auth-link" to="/signin">← Back to sign in</Link></AuthLayout>;
//   return <AuthLayout><div className="auth-head"><h1>Reset your password</h1><p>Enter the email associated with your account and we'll send a reset link.</p></div><form className="auth-form" onSubmit={handleSubmit(submit)} noValidate><Input label="Email" type="email" autoComplete="email" placeholder="you@company.com" error={errors.email?.message} {...register("email")} /><Button type="submit" fullWidth loading={isSubmitting}>Send reset link</Button></form><p className="auth-switch"><Link to="/signin">← Back to sign in</Link></p></AuthLayout>;
// }
