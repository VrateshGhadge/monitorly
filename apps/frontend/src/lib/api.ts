import axios from "axios";
import { BACKEND_URL } from "../config";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("monitorly.token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem("monitorly.token");

    // Only treat this as a session expiry if we were actually
    // sending a token — a failed login/signup 401 is not a logout.
    if (error.response?.status === 401 && hadToken) {
      window.dispatchEvent(new Event("auth:session-expired"));
    }

    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }

  return fallback;
}
