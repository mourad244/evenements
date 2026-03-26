import { clearToken } from "@/lib/auth/clear-token";
import { getToken } from "@/lib/auth/get-token";
import { setToken } from "@/lib/auth/set-token";

const SESSION_EXPIRED_KEY = "event-platform.session-expired";

export function persistSession(token: string) {
  setToken(token);
}

export function clearSession() {
  clearToken();
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

export function getAccessToken() {
  return getToken();
}
