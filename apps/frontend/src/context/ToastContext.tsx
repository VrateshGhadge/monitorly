import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { toast } from "sonner";

export type ToastVariant = "success" | "error" | "info";

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      if (variant === "error") toast.error(message);
      else if (variant === "info") toast.info(message);
      else toast.success(message);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);
  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
