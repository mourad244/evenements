import axios from "axios";

import { attachInterceptors } from "./interceptors";
import { SERVICE_URLS } from "./endpoints";

export const apiClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.gateway,
    timeout: 10_000
  })
);

export const authServiceClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.auth,
    timeout: 10_000
  })
);

export const eventServiceClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.events,
    timeout: 10_000
  })
);

export const registrationServiceClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.registrations,
    timeout: 10_000
  })
);

export const notificationServiceClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.notifications,
    timeout: 10_000
  })
);

export const paymentServiceClient = attachInterceptors(
  axios.create({
    baseURL: SERVICE_URLS.payments,
    timeout: 10_000
  })
);
