import { clearRefreshToken } from "@/lib/auth/clear-refresh-token";
import { clearToken } from "@/lib/auth/clear-token";
import { getToken } from "@/lib/auth/get-token";
import { setRefreshToken } from "@/lib/auth/set-refresh-token";
import { setToken } from "@/lib/auth/set-token";

const SESSION_EXPIRED_KEY = "event-platform.session-expired";

export function persistSession(accessToken: string, refreshToken?: string) {
  setToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);
}

export function clearSession() {
  clearToken();
  clearRefreshToken();
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
