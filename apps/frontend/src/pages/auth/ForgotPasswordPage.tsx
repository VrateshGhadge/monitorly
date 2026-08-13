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
        <div className="auth-head">
          <h1>Check your email</h1>

          <p>
            We've sent password reset instructions to <strong>{sent}</strong>.
          </p>
        </div>

        <Link className="auth-link" to="/signin">
          ← Back to sign in
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="auth-head">
        <h1>Reset your password</h1>

        <p>
          Enter the email associated with your account and we'll send a reset
          link.
        </p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
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

      <p className="auth-switch">
        <Link to="/signin">← Back to sign in</Link>
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
