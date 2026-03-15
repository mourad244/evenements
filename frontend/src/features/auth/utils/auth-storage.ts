import { clearToken } from "@/lib/auth/clear-token";
import { getToken } from "@/lib/auth/get-token";
import { setToken } from "@/lib/auth/set-token";
import type { User } from "@/types/user.types";

const USER_KEY = "event-platform.user";
const SESSION_EXPIRED_KEY = "event-platform.session-expired";

export function persistSession(token: string, user: User) {
  setToken(token);
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function clearSession() {
  clearToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_KEY);
  }
}

export function markSessionExpired() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(SESSION_EXPIRED_KEY, "true");
  }
}

export function hasSessionExpired() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_EXPIRED_KEY) === "true";
}

export function clearSessionExpired() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getToken();
}
