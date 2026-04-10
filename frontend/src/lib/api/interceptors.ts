import axios from "axios";
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig
} from "axios";

import { getToken } from "@/lib/auth/get-token";
import { ROUTES } from "@/lib/constants/routes";
import {
  clearSession,
  clearSessionExpired,
  getRefreshToken,
  markSessionExpired,
  persistSession
} from "@/features/auth/utils/auth-storage";
import { ENDPOINTS, SERVICE_URLS } from "./endpoints";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function redirectToSessionExpired() {
  if (typeof window === "undefined") {
    return;
  }

  const publicAuthRoutes = new Set<string>([
    ROUTES.login,
    ROUTES.register,
    ROUTES.forgotPassword,
    ROUTES.resetPassword,
    ROUTES.sessionExpired
  ]);

  if (!publicAuthRoutes.has(window.location.pathname)) {
    window.location.assign(ROUTES.sessionExpired);
  }
}

function expireSession() {
  clearSession();
  markSessionExpired();
  redirectToSessionExpired();
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${SERVICE_URLS.gateway}${ENDPOINTS.auth.refresh}`, {
        refreshToken
      })
      .then((response) => {
        const payload = response.data?.data || response.data || {};
        const accessToken = String(payload.accessToken || "").trim();
        const nextRefreshToken = String(payload.refreshToken || refreshToken).trim();

        if (!accessToken) {
          expireSession();
          return null;
        }

        persistSession({
          accessToken,
          refreshToken: nextRefreshToken || refreshToken
        });
        clearSessionExpired();
        return accessToken;
      })
      .catch(() => {
        expireSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const requestConfig = config as RetryableRequestConfig;
    const token = getToken();
    if (token && !requestConfig._skipAuthRefresh) {
      requestConfig.headers = requestConfig.headers || {};
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const requestConfig = (error.config || {}) as RetryableRequestConfig;
      const token = getToken();
      if (error?.response?.status === 401 && token) {
        if (requestConfig._retry || requestConfig._skipAuthRefresh) {
          expireSession();
          return Promise.reject(error);
        }

        const nextAccessToken = await refreshAccessToken();
        if (nextAccessToken) {
          requestConfig._retry = true;
          requestConfig.headers = requestConfig.headers || {};
          requestConfig.headers.Authorization = `Bearer ${nextAccessToken}`;
          return client(requestConfig);
        }

        expireSession();
      }
      return Promise.reject(error);
    }
  );

  return client;
}
