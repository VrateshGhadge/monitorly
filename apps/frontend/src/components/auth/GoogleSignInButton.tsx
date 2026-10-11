import { useEffect, useRef } from "react";

const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as
  | string
  | undefined;

let gsiScriptPromise: Promise<void> | null = null;

function loadGsiScript() {
  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () =>
        reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (credential: string) => void;
  text?: "continue_with" | "signin_with" | "signup_with";
}

export default function GoogleSignInButton({
  onCredential,
  text = "continue_with",
}: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);

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
        // GSI blocked or unavailable - leave the container empty.
      });

    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return <div className="auth-google" ref={containerRef} />;
}
