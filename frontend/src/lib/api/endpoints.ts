export const SERVICE_URLS = {
  gateway: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:8081",
  events: process.env.NEXT_PUBLIC_EVENT_SERVICE_URL || "http://localhost:8082",
  registrations:
    process.env.NEXT_PUBLIC_REGISTRATION_SERVICE_URL || "http://localhost:8083",
  notifications:
    process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "http://localhost:8084",
  payments: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || "http://localhost:8085"
} as const;

export const ENDPOINTS = {
  auth: {
    login: "/api/auth/login",
    refresh: "/api/auth/refresh",
    register: "/api/auth/register",
    me: "/api/auth/me",
    forgotPassword: "/api/auth/forgot-password",
    resetPassword: "/api/auth/reset-password"
  },
  admin: {
    users: "/api/admin/users"
  },
  events: {
    list: "/api/catalog/events",
    details: (eventId: string) => `/api/catalog/events/${eventId}`,
    organizerList: "/api/events/me",
    organizerCreate: "/api/events/drafts",
    organizerDetails: (eventId: string) => `/api/events/drafts/${eventId}`,
    organizerPublish: (eventId: string) => `/api/events/drafts/${eventId}/publish`
  },
  registrations: {
    create: "/api/registrations",
    mine: "/api/profile/participations",
    cancel: (registrationId: string) => `/api/registrations/${registrationId}/cancel`,
    organizerEventRegistrations: (eventId: string) =>
      `/api/organizer/events/${eventId}/registrations`,
    organizerEventRegistrationsExport: (eventId: string) =>
      `/api/organizer/events/${eventId}/registrations/export`
  },
  tickets: {
    download: (ticketId: string) => `/api/tickets/${encodeURIComponent(ticketId)}/download`
  }
} as const;
