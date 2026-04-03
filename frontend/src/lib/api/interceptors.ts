import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import { clearSession, markSessionExpired } from "@/features/auth/utils/auth-storage";
import { getRefreshToken } from "@/lib/auth/get-refresh-token";
import { getToken } from "@/lib/auth/get-token";
import { setRefreshToken } from "@/lib/auth/set-refresh-token";
import { setToken } from "@/lib/auth/set-token";
import { ROUTES } from "@/lib/constants/routes";

import { ENDPOINTS, SERVICE_URLS } from "./endpoints";

// Shared promise so concurrent 401s don't each trigger a separate refresh call
let refreshingPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await axios.post(
      `${SERVICE_URLS.gateway}${ENDPOINTS.auth.refresh}`,
      { refreshToken }
    );
    const data = response.data?.data || response.data;
    const newAccessToken = String(data.accessToken || "");
    const newRefreshToken = data.refreshToken ? String(data.refreshToken) : undefined;

    if (!newAccessToken) return null;

    setToken(newAccessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);
    return newAccessToken;
  } catch {
    return null;
  }
}

function forceLogout() {
  clearSession();
  markSessionExpired();

  if (typeof window !== "undefined") {
    const publicRoutes = new Set<string>([
      ROUTES.login,
      ROUTES.register,
      ROUTES.forgotPassword,
      ROUTES.resetPassword,
      ROUTES.sessionExpired
    ]);

    if (!publicRoutes.has(window.location.pathname)) {
      window.location.assign(ROUTES.sessionExpired);
    }
  }
}

export function attachInterceptors(client: AxiosInstance) {
  // Attach Bearer token to every outgoing request
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // On 401: attempt a single token refresh, then retry; on second failure force logout
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retried?: boolean;
      };

      if (
        error?.response?.status === 401 &&
        getToken() &&
        !originalRequest._retried
      ) {
        originalRequest._retried = true;

        // Serialise concurrent refresh attempts into one network call
        if (!refreshingPromise) {
          refreshingPromise = attemptTokenRefresh().finally(() => {
            refreshingPromise = null;
          });
        }

        const newToken = await refreshingPromise;

        if (newToken) {
          // Patch the Authorization header and replay the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return client(originalRequest);
        }

        // Refresh failed — end the session
        forceLogout();
      }

      return Promise.reject(error);
    }
  );

  return client;
}
