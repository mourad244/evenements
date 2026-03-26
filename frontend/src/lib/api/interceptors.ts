import type { AxiosInstance } from "axios";

import { getToken } from "@/lib/auth/get-token";
import { ROUTES } from "@/lib/constants/routes";
import {
  clearSession,
  markSessionExpired
} from "@/features/auth/utils/auth-storage";

export function attachInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const token = getToken();
      if (error?.response?.status === 401 && token) {
        clearSession();
        markSessionExpired();

        if (typeof window !== "undefined") {
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
      }
      return Promise.reject(error);
    }
  );

  return client;
}
