export function clearRefreshToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("event-platform.refresh-token");
}
