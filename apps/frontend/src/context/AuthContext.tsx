// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as authApi from "../api/auth";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;

  signIn: (email: string, password: string) => Promise<AuthUser>;

  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;

  signOut: () => void;
  clearSessionExpired: () => void;

  updateUser: (patch: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_STORAGE_KEY = "monitorly.user";
const TOKEN_STORAGE_KEY = "monitorly.token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Load user from storage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);

      if (raw) {
        setUser(JSON.parse(raw));
      }
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for session expiry events from API interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      signOut();
      setSessionExpired(true);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, []);

  const persist = (user: AuthUser, token: string) => {
    setUser(user);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  };

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { user, token } = await authApi.login(email, password);
    persist(user, token);
    return user;
  };

  const signUp: AuthContextValue["signUp"] = async (name, email, password) => {
    const { user, token } = await authApi.signup(name, email, password);
    persist(user, token);
    return user;
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const updateUser = (patch: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;

      const next = {
        ...prev,
        ...patch,
      };

      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      sessionExpired,
      signIn,
      signUp,
      signOut,
      clearSessionExpired,
      updateUser,
    }),
    [user, isLoading, sessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
