import { api } from "../lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: AuthUser;
  };
}

export async function signup(name: string, email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/v1/user/signup", {
    name,
    email,
    password,
  });

  return data.data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post<AuthResponse>("/api/v1/user/login", {
    email,
    password,
  });

  return data.data;
}
