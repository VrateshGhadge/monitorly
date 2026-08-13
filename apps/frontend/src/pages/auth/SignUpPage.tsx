import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage } from "../../lib/api";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export default function SignUpPage() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const strength = passwordStrength(password);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][
    strength
  ];

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Enter your full name.";
    if (!email.trim()) next.email = "Enter your email address.";
    else if (!/^\S+@\S+\.\S+$/.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Choose a password.";
    else if (password.length < 8) next.password = "Use at least 8 characters.";
    if (confirmPassword !== password)
      next.confirmPassword = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await signUp(name, email, password);
      showToast("Account created — welcome to Monitorly.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showToast(
        getErrorMessage(
          error,
          "Something went wrong creating your account. Please try again.",
        ),
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-head">
        <h1>Create your account</h1>
        <p>Set up your first monitor in minutes.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          placeholder="Jordan Lee"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <PasswordInput
          label="Password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {password && (
          <div className="password-strength">
            <div className="password-strength-track">
              <span className={`password-strength-fill strength-${strength}`} />
            </div>
            <small>{strengthLabel}</small>
          </div>
        )}

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" fullWidth loading={submitting}>
          Create account
        </Button>

        <p className="auth-terms">
          By creating an account you agree to Monitorly's Terms of Service and
          Privacy Policy.
        </p>
      </form>

      <p className="auth-switch">
        Already have an account? <Link to="/signin">Sign in</Link>
      </p>
    </AuthLayout>
  );
}

// import { useState, type FormEvent } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import AuthLayout from "../../components/auth/AuthLayout";
// import Input from "../../components/ui/Input";
// import PasswordInput from "../../components/ui/PasswordInput";
// import Button from "../../components/ui/Button";
// import { useAuth } from "../../context/AuthContext";
// import { useToast } from "../../context/ToastContext";

// interface FormErrors {
//   name?: string;
//   email?: string;
//   password?: string;
//   confirmPassword?: string;
// }

// function passwordStrength(password: string) {
//   let score = 0;
//   if (password.length >= 8) score++;
//   if (/[A-Z]/.test(password)) score++;
//   if (/[0-9]/.test(password)) score++;
//   if (/[^A-Za-z0-9]/.test(password)) score++;
//   return score;
// }

// export default function SignUpPage() {
//   const { signUp } = useAuth();
//   const { showToast } = useToast();
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errors, setErrors] = useState<FormErrors>({});
//   const [submitting, setSubmitting] = useState(false);

//   const strength = passwordStrength(password);
//   const strengthLabel = ["Too weak", "Weak", "Fair", "Good", "Strong"][strength];

//   const validate = (): boolean => {
//     const next: FormErrors = {};
//     if (!name.trim()) next.name = "Enter your full name.";
//     if (!email.trim()) next.email = "Enter your email address.";
//     else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = "Enter a valid email address.";
//     if (!password) next.password = "Choose a password.";
//     else if (password.length < 8) next.password = "Use at least 8 characters.";
//     if (confirmPassword !== password) next.confirmPassword = "Passwords don't match.";
//     setErrors(next);
//     return Object.keys(next).length === 0;
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!validate()) return;
//     setSubmitting(true);
//     try {
//       await signUp(name, email, password);
//       showToast("Account created — welcome to Monitorly.");
//       navigate("/dashboard", { replace: true });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <AuthLayout>
//       <div className="auth-head">
//         <h1>Create your account</h1>
//         <p>Set up your first monitor in minutes.</p>
//       </div>

//       <form className="auth-form" onSubmit={handleSubmit} noValidate>
//         <Input
//           label="Full name"
//           autoComplete="name"
//           placeholder="Jordan Lee"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           error={errors.name}
//         />

//         <Input
//           label="Email"
//           type="email"
//           autoComplete="email"
//           placeholder="you@company.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           error={errors.email}
//         />

//         <PasswordInput
//           label="Password"
//           autoComplete="new-password"
//           placeholder="At least 8 characters"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           error={errors.password}
//         />

//         {password && (
//           <div className="password-strength">
//             <div className="password-strength-track">
//               <span className={`password-strength-fill strength-${strength}`} />
//             </div>
//             <small>{strengthLabel}</small>
//           </div>
//         )}

//         <PasswordInput
//           label="Confirm password"
//           autoComplete="new-password"
//           placeholder="Re-enter your password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           error={errors.confirmPassword}
//         />

//         <Button type="submit" fullWidth loading={submitting}>
//           Create account
//         </Button>

//         <p className="auth-terms">
//           By creating an account you agree to Monitorly's Terms of Service and Privacy Policy.
//         </p>
//       </form>

//       <p className="auth-switch">
//         Already have an account? <Link to="/signin">Sign in</Link>
//       </p>
//     </AuthLayout>
//   );
// }
