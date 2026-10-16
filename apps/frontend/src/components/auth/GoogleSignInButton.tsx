import { useEffect, useRef, useState } from "react";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  text?: "continue_with" | "signin_with" | "signup_with";
}

const PLACEHOLDER_LABEL: Record<
  NonNullable<GoogleSignInButtonProps["text"]>,
  string
> = {
  signin_with: "Sign in with Google",
  signup_with: "Sign up with Google",
  continue_with: "Continue with Google",
};

let gsiScriptPromise: Promise<void> | null = null;

function loadGsiScript() {
  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // index.html already tags this script so it downloads alongside the app
      // bundle - attach to that element rather than fetching a second copy.
      const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${GSI_SCRIPT_SRC}"]`,
      );

      const onLoad = () => resolve();
      const onError = () =>
        reject(new Error("Failed to load Google Identity Services"));

      if (existing) {
        existing.addEventListener("load", onLoad, { once: true });
        existing.addEventListener("error", onError, { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      script.onerror = onError;
      document.head.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [gsiFailed, setGsiFailed] = useState(false);

  callbackRef.current = onCredential;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    loadGsiScript()
      .then(() => {
        const container = containerRef.current;

        if (cancelled || !container || !window.google) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => callbackRef.current(response.credential),
        });

        const width = Math.min(
          400,
          Math.max(200, Math.round(container.offsetWidth) || 300),
        );

        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          logo_alignment: "left",
          text,
          width,
        });
      })
      .catch(() => {
        if (!cancelled) setGsiFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  // Without a client id there is nothing to render, and if GSI is unreachable
  // (blocked, offline) a dead button is worse than no button.
  if (!GOOGLE_CLIENT_ID || gsiFailed) {
    return null;
  }

  return (
    <div className="auth-google-slot">
      {/* Empty on purpose: Google stamps its button in here, so nothing React
          owns may live inside it. */}
      <div className="auth-google" ref={containerRef} />

      {/* Kept in the tree permanently - CSS uncovers the real button the moment
          Google renders it, so nothing here has to guess when that happens. */}
      <div className="auth-google-fallback" aria-hidden="true">
        <GoogleMark />
        <span>{PLACEHOLDER_LABEL[text]}</span>
      </div>
    </div>
  );
}
