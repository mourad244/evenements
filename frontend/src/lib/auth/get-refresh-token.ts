export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("event-platform.refresh-token");
}
