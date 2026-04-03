export function setRefreshToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("event-platform.refresh-token", token);
}
