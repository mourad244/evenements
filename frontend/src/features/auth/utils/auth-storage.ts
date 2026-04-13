import { clearToken } from "@/lib/auth/clear-token";
import { getToken } from "@/lib/auth/get-token";
import { setToken } from "@/lib/auth/set-token";

const SESSION_EXPIRED_KEY = "event-platform.session-expired";
const REFRESH_TOKEN_KEY = "event-platform.refresh-token";

type SessionTokens = {
  accessToken: string;
  refreshToken?: string | null;
};

export function persistSession(session: SessionTokens) {
  setToken(session.accessToken);

  if (typeof window === "undefined") return;

  if (session.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearSession() {
  clearToken();
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
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

export function getAccessToken() {
  return getToken();
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
