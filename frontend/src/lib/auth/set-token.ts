export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("event-platform.token", token);
  document.cookie = `event-platform.token=${token}; path=/; max-age=86400; samesite=lax`;
}
