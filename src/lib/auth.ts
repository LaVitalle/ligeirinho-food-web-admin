import { api, ApiResponse } from "./api";

export type AuthData = {
  accessToken: string;
  user: Record<string, unknown>;
};

export type AuthResponse = ApiResponse<AuthData>;

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  accessCode: string;
};

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", payload);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/register", payload);
}

export function saveAuthToken(token: string) {
  localStorage.setItem("ligeirinho_auth_token", token);
}

export function isAuthenticated() {
  return !!localStorage.getItem("ligeirinho_auth_token");
}

export function logout() {
  localStorage.removeItem("ligeirinho_auth_token");
}
