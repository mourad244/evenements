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
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    me: "/api/v1/auth/me",
    profile: "/api/v1/profile",
    forgotPassword: "/api/v1/auth/forgot-password",
    resetPassword: "/api/v1/auth/reset-password"
  },
  admin: {
    users: "/api/v1/admin/users"
  },
  events: {
    list: "/api/v1/catalog/events",
    details: (eventId: string) => `/api/v1/catalog/events/${eventId}`,
    organizerList: "/api/v1/events/me",
    organizerCreate: "/api/v1/events/drafts",
    organizerDetails: (eventId: string) => `/api/v1/events/drafts/${eventId}`,
    organizerPublish: (eventId: string) => `/api/v1/events/drafts/${eventId}/publish`
  },
  registrations: {
    create: "/api/v1/registrations",
    mine: "/api/v1/profile/participations",
    cancel: (registrationId: string) => `/api/v1/registrations/${registrationId}/cancel`,
    organizerEventRegistrations: (eventId: string) =>
      `/api/v1/organizer/events/${eventId}/registrations`,
    organizerEventRegistrationsExport: (eventId: string) =>
      `/api/v1/organizer/events/${eventId}/registrations/export`
  },
  tickets: {
    details: (ticketId: string) => `/api/v1/tickets/${ticketId}`
  },
  notifications: {
    list: "/api/v1/notifications",
    markRead: (notificationId: string) =>
      `/api/v1/notifications/${notificationId}/read`
  },
  payments: {
    session: "/api/v1/payments/session"
  }
} as const;
