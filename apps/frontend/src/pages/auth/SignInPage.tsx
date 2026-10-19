import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";
import { signInInput, type SignInInput } from "@repo/validation";

type SignInValues = SignInInput;

export default function SignInPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const { showToast } = useToast();

  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInInput),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const submit = async ({ email, password }: SignInValues) => {
    try {
      await signIn(email, password);

      showToast("Welcome back — you're signed in.");

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      showToast(
        getErrorMessage(error, "Invalid email or password. Please try again."),
        "error",
      );
    }
  };

  const handleGoogleSignIn = async (credential: string) => {
    if (googleLoading) return;

    try {
      setGoogleLoading(true);

      await signInWithGoogle(credential);

      showToast("Welcome back — you're signed in.");

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      showToast(
        getErrorMessage(error, "Google sign-in failed. Please try again."),
        "error",
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-[22px]">
        <h1 className="mt-0 mb-1.5 text-[24px] tracking-[-0.9px] [@media(max-width:520px)]:text-[22px]">
          Welcome back
        </h1>
        <p className="m-0 text-[13.5px] text-muted">
          Sign in to keep watching your monitors.
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

        <PasswordInput
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="-mt-0.5 mb-4 flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-[7px] text-[12.5px] text-[#c9cdd3] select-none">
            <input
              className="size-3.5 accent-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand focus-visible:rounded-md"
              type="checkbox"
              {...register("remember")}
            />
            <span>Remember me</span>
          </label>

          {/* <Link
            className="auth-link"
            to="/forgot-password"
          >
            Forgot password?
          </Link> */}
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <div className="auth-divider">or</div>

      <GoogleSignInButton
        onCredential={handleGoogleSignIn}
        text="signin_with"
      />

      <p className="mt-[18px] mb-0 text-center text-[13px] text-muted">
        Don't have an account?{" "}
        <Link className="font-semibold text-brand" to="/signup">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { Link, useLocation, useNavigate } from "react-router-dom";

// import AuthLayout from "../../components/auth/AuthLayout";
// import Button from "../../components/ui/Button";
// import Input from "../../components/ui/Input";
// import PasswordInput from "../../components/ui/PasswordInput";

// import { useAuth } from "../../context/AuthContext";
// import { useToast } from "../../context/ToastContext";
// import { signInInput, type SignInInput } from "@repo/validation";

// type SignInValues = SignInInput;

// export default function SignInPage() {
//   const { signIn } = useAuth();
//   const { showToast } = useToast();

//   const navigate = useNavigate();
//   const location = useLocation();

//   const {
//     register,
//     handleSubmit,
//     formState: {
//       errors,
//       isSubmitting,
//     },
//   } = useForm<SignInValues>({
//     resolver: zodResolver(signInInput),
//     defaultValues: {
//       email: "",
//       password: "",
//       remember: true,
//     },
//   });

//   const redirectTo =
//     (location.state as { from?: string } | null)?.from ?? "/dashboard";

//   const submit = async ({ email, password }: SignInValues) => {
//     await signIn(email, password);

//     showToast("Welcome back — you're signed in.");

//     navigate(redirectTo, {
//       replace: true,
//     });
//   };

//   return (
//     <AuthLayout>
//       <div className="auth-head">
//         <h1>Welcome back</h1>
//         <p>Sign in to keep watching your monitors.</p>
//       </div>

//       <form
//         className="auth-form"
//         onSubmit={handleSubmit(submit)}
//         noValidate
//       >
//         <Input
//           label="Email"
//           type="email"
//           autoComplete="email"
//           placeholder="you@company.com"
//           error={errors.email?.message}
//           {...register("email")}
//         />

//         <PasswordInput
//           label="Password"
//           autoComplete="current-password"
//           placeholder="Enter your password"
//           error={errors.password?.message}
//           {...register("password")}
//         />

//         <div className="auth-row">
//           <label className="checkbox-field">
//             <input
//               type="checkbox"
//               {...register("remember")}
//             />
//             <span>Remember me</span>
//           </label>

//           {/* <Link
//             className="auth-link"
//             to="/forgot-password"
//           >
//             Forgot password?
//           </Link> */}
//         </div>

//         <Button
//           type="submit"
//           fullWidth
//           loading={isSubmitting}
//         >
//           Sign in
//         </Button>
//       </form>

//       <p className="auth-switch">
//         Don't have an account?{" "}
//         <Link to="/signup">
//           Sign up
//         </Link>
//       </p>
//     </AuthLayout>
//   );
// }
