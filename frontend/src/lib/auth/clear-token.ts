export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("event-platform.token");
  document.cookie = "event-platform.token=; path=/; max-age=0; samesite=lax";
}
