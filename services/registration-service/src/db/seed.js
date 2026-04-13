import { Pool } from "pg";

import { ensureSchema } from "./schema.js";

const config = {
  databaseUrl:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01"
};

const now = Date.now();

function isoOffset({ days = 0, hours = 0, minutes = 0 } = {}) {
  return new Date(
    now + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000 + minutes * 60 * 1000
  ).toISOString();
}

function describeDatabaseTarget(connectionString) {
  try {
    const url = new URL(connectionString);
    return `${url.hostname}:${url.port || "5432"}${url.pathname}`;
  } catch {
    return "custom DATABASE_URL";
  }
}

function buildTicketRef(eventId, registrationId) {
  return `TCK-${String(eventId).slice(-4).toUpperCase()}-${String(registrationId)
    .replace(/-/g, "")
    .slice(-6)
    .toUpperCase()}`;
}

function buildTicketPayload(registration) {
  return {
    ticketId: registration.ticketId,
    registrationId: registration.registrationId,
    eventId: registration.eventId,
    eventTitle: registration.eventTitle,
    eventCity: registration.eventCity,
    eventStartAt: registration.eventStartAt,
    participantId: registration.participantId,
    participantName: registration.participantName,
    ticketRef: registration.ticketRef,
    format: "PDF",
    status: "ISSUED",
    issuedAt: registration.createdAt
  };
}

const demoEvents = {
  event1: {
    eventId: "00000000-0000-4000-8000-000000001001",
    eventTitle: "Casablanca Product Summit",
    eventCity: "Casablanca",
    eventStartAt: isoOffset({ days: 12, hours: 9 }),
    eventCapacity: 120
  },
  event2: {
    eventId: "00000000-0000-4000-8000-000000001002",
    eventTitle: "Rabat Open Tech Night",
    eventCity: "Rabat",
    eventStartAt: isoOffset({ days: 18, hours: 18 }),
    eventCapacity: 80
  },
  event3: {
    eventId: "00000000-0000-4000-8000-000000001003",
    eventTitle: "Marrakech Organizer Workshop",
    eventCity: "Marrakech",
    eventStartAt: isoOffset({ days: 27, hours: 10 }),
    eventCapacity: 40
  },
  event5: {
    eventId: "00000000-0000-4000-8000-000000001005",
    eventTitle: "Fez Creator Meetup",
    eventCity: "Fez",
    eventStartAt: isoOffset({ days: 22, hours: 15 }),
    eventCapacity: 150
  },
  event6: {
    eventId: "00000000-0000-4000-8000-000000001006",
    eventTitle: "Casablanca Internal Organizer Retro",
    eventCity: "Casablanca",
    eventStartAt: isoOffset({ days: 30, hours: 11 }),
    eventCapacity: 25
  }
};

const demoRegistrations = [
  {
    registrationId: "00000000-0000-4000-8000-000000002001",
    eventId: demoEvents.event1.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    participantName: "Leila Participant",
    participantEmail: "leila.participant@evenements.local",
    eventTitle: demoEvents.event1.eventTitle,
    eventCity: demoEvents.event1.eventCity,
    eventStartAt: demoEvents.event1.eventStartAt,
    eventCapacity: demoEvents.event1.eventCapacity,
    registrationStatus: "CONFIRMED",
    waitlistPosition: null,
    ticketId: "00000000-0000-4000-8000-000000003001",
    ticketRef: buildTicketRef(demoEvents.event1.eventId, "00000000-0000-4000-8000-000000002001"),
    createdAt: isoOffset({ days: -3, hours: -2 }),
    updatedAt: isoOffset({ days: -2 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002002",
    eventId: demoEvents.event1.eventId,
    participantId: "00000000-0000-4000-8000-000000000105",
    participantName: "Amine Participant",
    participantEmail: "amine.participant@evenements.local",
    eventTitle: demoEvents.event1.eventTitle,
    eventCity: demoEvents.event1.eventCity,
    eventStartAt: demoEvents.event1.eventStartAt,
    eventCapacity: demoEvents.event1.eventCapacity,
    registrationStatus: "WAITLISTED",
    waitlistPosition: 1,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -2, hours: -4 }),
    updatedAt: isoOffset({ days: -1, hours: -6 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002003",
    eventId: demoEvents.event2.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    participantName: "Leila Participant",
    participantEmail: "leila.participant@evenements.local",
    eventTitle: demoEvents.event2.eventTitle,
    eventCity: demoEvents.event2.eventCity,
    eventStartAt: demoEvents.event2.eventStartAt,
    eventCapacity: demoEvents.event2.eventCapacity,
    registrationStatus: "WAITLISTED",
    waitlistPosition: 2,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -5, hours: -6 }),
    updatedAt: isoOffset({ days: -1, hours: -9 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002004",
    eventId: demoEvents.event2.eventId,
    participantId: "00000000-0000-4000-8000-000000000107",
    participantName: "Nora Disabled",
    participantEmail: "nora.disabled@evenements.local",
    eventTitle: demoEvents.event2.eventTitle,
    eventCity: demoEvents.event2.eventCity,
    eventStartAt: demoEvents.event2.eventStartAt,
    eventCapacity: demoEvents.event2.eventCapacity,
    registrationStatus: "CONFIRMED",
    waitlistPosition: null,
    ticketId: "00000000-0000-4000-8000-000000003002",
    ticketRef: buildTicketRef(demoEvents.event2.eventId, "00000000-0000-4000-8000-000000002004"),
    createdAt: isoOffset({ days: -4, hours: -3 }),
    updatedAt: isoOffset({ days: -2, hours: -1 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002005",
    eventId: demoEvents.event3.eventId,
    participantId: "00000000-0000-4000-8000-000000000106",
    participantName: "Sara Locked",
    participantEmail: "sara.locked@evenements.local",
    eventTitle: demoEvents.event3.eventTitle,
    eventCity: demoEvents.event3.eventCity,
    eventStartAt: demoEvents.event3.eventStartAt,
    eventCapacity: demoEvents.event3.eventCapacity,
    registrationStatus: "CANCELLED",
    waitlistPosition: null,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -8, hours: -2 }),
    updatedAt: isoOffset({ days: -3, hours: -5 }),
    cancelledAt: isoOffset({ days: -3, hours: -5 }),
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002006",
    eventId: demoEvents.event3.eventId,
    participantId: "00000000-0000-4000-8000-000000000105",
    participantName: "Amine Participant",
    participantEmail: "amine.participant@evenements.local",
    eventTitle: demoEvents.event3.eventTitle,
    eventCity: demoEvents.event3.eventCity,
    eventStartAt: demoEvents.event3.eventStartAt,
    eventCapacity: demoEvents.event3.eventCapacity,
    registrationStatus: "REJECTED",
    waitlistPosition: null,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -9, hours: -1 }),
    updatedAt: isoOffset({ days: -6, hours: -8 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002007",
    eventId: demoEvents.event1.eventId,
    participantId: "00000000-0000-4000-8000-000000000105",
    participantName: "Amine Participant",
    participantEmail: "amine.participant@evenements.local",
    eventTitle: demoEvents.event1.eventTitle,
    eventCity: demoEvents.event1.eventCity,
    eventStartAt: demoEvents.event1.eventStartAt,
    eventCapacity: demoEvents.event1.eventCapacity,
    registrationStatus: "CANCELLED",
    waitlistPosition: null,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -6, hours: -3 }),
    updatedAt: isoOffset({ days: -4, hours: -5 }),
    cancelledAt: isoOffset({ days: -4, hours: -5 }),
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002008",
    eventId: demoEvents.event2.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    participantName: "Leila Participant",
    participantEmail: "leila.participant@evenements.local",
    eventTitle: demoEvents.event2.eventTitle,
    eventCity: demoEvents.event2.eventCity,
    eventStartAt: demoEvents.event2.eventStartAt,
    eventCapacity: demoEvents.event2.eventCapacity,
    registrationStatus: "CANCELLED",
    waitlistPosition: null,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -7, hours: -4 }),
    updatedAt: isoOffset({ days: -5, hours: -2 }),
    cancelledAt: isoOffset({ days: -5, hours: -2 }),
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002009",
    eventId: demoEvents.event5.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    participantName: "Leila Participant",
    participantEmail: "leila.participant@evenements.local",
    eventTitle: demoEvents.event5.eventTitle,
    eventCity: demoEvents.event5.eventCity,
    eventStartAt: demoEvents.event5.eventStartAt,
    eventCapacity: demoEvents.event5.eventCapacity,
    registrationStatus: "CONFIRMED",
    waitlistPosition: null,
    ticketId: "00000000-0000-4000-8000-000000003003",
    ticketRef: buildTicketRef(demoEvents.event5.eventId, "00000000-0000-4000-8000-000000002009"),
    createdAt: isoOffset({ days: -4, hours: -7 }),
    updatedAt: isoOffset({ days: -3, hours: -2 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002010",
    eventId: demoEvents.event5.eventId,
    participantId: "00000000-0000-4000-8000-000000000106",
    participantName: "Sara Locked",
    participantEmail: "sara.locked@evenements.local",
    eventTitle: demoEvents.event5.eventTitle,
    eventCity: demoEvents.event5.eventCity,
    eventStartAt: demoEvents.event5.eventStartAt,
    eventCapacity: demoEvents.event5.eventCapacity,
    registrationStatus: "WAITLISTED",
    waitlistPosition: 1,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -4, hours: -1 }),
    updatedAt: isoOffset({ days: -2, hours: -12 }),
    cancelledAt: null,
    promotedAt: null
  },
  {
    registrationId: "00000000-0000-4000-8000-000000002011",
    eventId: demoEvents.event6.eventId,
    participantId: "00000000-0000-4000-8000-000000000107",
    participantName: "Nora Disabled",
    participantEmail: "nora.disabled@evenements.local",
    eventTitle: demoEvents.event6.eventTitle,
    eventCity: demoEvents.event6.eventCity,
    eventStartAt: demoEvents.event6.eventStartAt,
    eventCapacity: demoEvents.event6.eventCapacity,
    registrationStatus: "CANCELLED",
    waitlistPosition: null,
    ticketId: null,
    ticketRef: null,
    createdAt: isoOffset({ days: -3, hours: -4 }),
    updatedAt: isoOffset({ days: -2, hours: -4 }),
    cancelledAt: isoOffset({ days: -2, hours: -4 }),
    promotedAt: null
  }
];

const demoTickets = demoRegistrations
  .filter((registration) => registration.ticketId)
  .map((registration) => ({
    ticketId: registration.ticketId,
    registrationId: registration.registrationId,
    eventId: registration.eventId,
    participantId: registration.participantId,
    ticketRef: registration.ticketRef,
    ticketFormat: "PDF",
    ticketStatus: "ISSUED",
    payload: buildTicketPayload(registration),
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt
  }));

const demoNotifications = [
  {
    notificationId: "00000000-0000-4000-8000-000000004001",
    recipientId: "00000000-0000-4000-8000-000000000102",
    recipientRole: "ORGANIZER",
    eventId: demoEvents.event1.eventId,
    registrationId: null,
    notificationType: "EVENT_PUBLISHED",
    title: "Event published",
    message: "Casablanca Product Summit is now visible in the public catalog.",
    metadata: {
      eventTitle: demoEvents.event1.eventTitle,
      eventCity: demoEvents.event1.eventCity,
      eventStartAt: demoEvents.event1.eventStartAt
    },
    isRead: false,
    createdAt: isoOffset({ days: -2, hours: -3 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004002",
    recipientId: "00000000-0000-4000-8000-000000000104",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event1.eventId,
    registrationId: "00000000-0000-4000-8000-000000002001",
    notificationType: "REGISTRATION_CONFIRMED",
    title: "Registration confirmed",
    message: "Your seat is confirmed for Casablanca Product Summit.",
    metadata: {
      eventTitle: demoEvents.event1.eventTitle,
      eventCity: demoEvents.event1.eventCity,
      eventStartAt: demoEvents.event1.eventStartAt
    },
    isRead: false,
    createdAt: isoOffset({ days: -2, hours: -1 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004003",
    recipientId: "00000000-0000-4000-8000-000000000104",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event2.eventId,
    registrationId: "00000000-0000-4000-8000-000000002003",
    notificationType: "WAITLISTED",
    title: "Waitlist update",
    message: "You are currently waitlisted for Rabat Open Tech Night.",
    metadata: {
      eventTitle: demoEvents.event2.eventTitle,
      eventCity: demoEvents.event2.eventCity,
      eventStartAt: demoEvents.event2.eventStartAt,
      waitlistPosition: 2
    },
    isRead: true,
    createdAt: isoOffset({ days: -1, hours: -10 }),
    readAt: isoOffset({ days: -1, hours: -8 })
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004004",
    recipientId: "00000000-0000-4000-8000-000000000107",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event2.eventId,
    registrationId: "00000000-0000-4000-8000-000000002004",
    notificationType: "TICKET_READY",
    title: "Ticket ready",
    message: "Your ticket is ready to download for Rabat Open Tech Night.",
    metadata: {
      eventTitle: demoEvents.event2.eventTitle,
      eventCity: demoEvents.event2.eventCity,
      eventStartAt: demoEvents.event2.eventStartAt,
      ticketRef: demoRegistrations[3].ticketRef
    },
    isRead: false,
    createdAt: isoOffset({ days: -2, hours: -6 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004005",
    recipientId: "00000000-0000-4000-8000-000000000102",
    recipientRole: "ORGANIZER",
    eventId: demoEvents.event5.eventId,
    registrationId: null,
    notificationType: "EVENT_PUBLISHED",
    title: "Another event is live",
    message: "Fez Creator Meetup is now available in the public catalog.",
    metadata: {
      eventTitle: demoEvents.event5.eventTitle,
      eventCity: demoEvents.event5.eventCity,
      eventStartAt: demoEvents.event5.eventStartAt
    },
    isRead: false,
    createdAt: isoOffset({ days: -5, hours: -3 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004006",
    recipientId: "00000000-0000-4000-8000-000000000104",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event1.eventId,
    registrationId: "00000000-0000-4000-8000-000000002007",
    notificationType: "REGISTRATION_CANCELLED",
    title: "Registration cancelled",
    message: "Your Casablanca Product Summit registration was cancelled.",
    metadata: {
      eventTitle: demoEvents.event1.eventTitle,
      eventCity: demoEvents.event1.eventCity,
      eventStartAt: demoEvents.event1.eventStartAt
    },
    isRead: false,
    createdAt: isoOffset({ days: -4, hours: -4 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004007",
    recipientId: "00000000-0000-4000-8000-000000000104",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event5.eventId,
    registrationId: "00000000-0000-4000-8000-000000002009",
    notificationType: "TICKET_READY",
    title: "Ticket ready for download",
    message: "Your Fez Creator Meetup ticket can now be downloaded.",
    metadata: {
      eventTitle: demoEvents.event5.eventTitle,
      eventCity: demoEvents.event5.eventCity,
      eventStartAt: demoEvents.event5.eventStartAt,
      ticketRef: demoRegistrations[8].ticketRef
    },
    isRead: false,
    createdAt: isoOffset({ days: -3, hours: -1 }),
    readAt: null
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004008",
    recipientId: "00000000-0000-4000-8000-000000000106",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event5.eventId,
    registrationId: "00000000-0000-4000-8000-000000002010",
    notificationType: "WAITLIST_PROMOTED",
    title: "Waitlist position updated",
    message: "You are first on the waitlist for Fez Creator Meetup.",
    metadata: {
      eventTitle: demoEvents.event5.eventTitle,
      eventCity: demoEvents.event5.eventCity,
      eventStartAt: demoEvents.event5.eventStartAt,
      waitlistPosition: 1
    },
    isRead: true,
    createdAt: isoOffset({ days: -2, hours: -8 }),
    readAt: isoOffset({ days: -2, hours: -6 })
  },
  {
    notificationId: "00000000-0000-4000-8000-000000004009",
    recipientId: "00000000-0000-4000-8000-000000000107",
    recipientRole: "PARTICIPANT",
    eventId: demoEvents.event6.eventId,
    registrationId: "00000000-0000-4000-8000-000000002011",
    notificationType: "REGISTRATION_CANCELLED",
    title: "Internal retro cancelled",
    message: "The private organizer retro was cancelled before launch.",
    metadata: {
      eventTitle: demoEvents.event6.eventTitle,
      eventCity: demoEvents.event6.eventCity,
      eventStartAt: demoEvents.event6.eventStartAt
    },
    isRead: false,
    createdAt: isoOffset({ days: -2, hours: -3 }),
    readAt: null
  }
];

const demoPayments = [
  {
    paymentId: "00000000-0000-4000-8000-000000005001",
    registrationId: "00000000-0000-4000-8000-000000002001",
    eventId: demoEvents.event1.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    amount: 12000,
    currency: "MAD",
    status: "SUCCEEDED",
    provider: "manual",
    providerSessionId: "seed-payment-session-leila-1",
    providerPaymentId: "seed-provider-payment-leila-1",
    metadata: {
      eventTitle: demoEvents.event1.eventTitle,
      ticketRef: demoRegistrations[0].ticketRef
    },
    lastWebhookId: "seed-webhook-leila-1",
    createdAt: isoOffset({ days: -2, hours: -1 }),
    updatedAt: isoOffset({ days: -2 })
  },
  {
    paymentId: "00000000-0000-4000-8000-000000005002",
    registrationId: "00000000-0000-4000-8000-000000002004",
    eventId: demoEvents.event2.eventId,
    participantId: "00000000-0000-4000-8000-000000000107",
    amount: 0,
    currency: "MAD",
    status: "PENDING",
    provider: "manual",
    providerSessionId: "seed-payment-session-nora-1",
    providerPaymentId: null,
    metadata: {
      eventTitle: demoEvents.event2.eventTitle,
      ticketRef: demoRegistrations[3].ticketRef
    },
    lastWebhookId: null,
    createdAt: isoOffset({ days: -3, hours: -2 }),
    updatedAt: isoOffset({ days: -3, hours: -1 })
  },
  {
    paymentId: "00000000-0000-4000-8000-000000005003",
    registrationId: "00000000-0000-4000-8000-000000002009",
    eventId: demoEvents.event5.eventId,
    participantId: "00000000-0000-4000-8000-000000000104",
    amount: 2500,
    currency: "MAD",
    status: "SUCCEEDED",
    provider: "manual",
    providerSessionId: "seed-payment-session-leila-2",
    providerPaymentId: "seed-provider-payment-leila-2",
    metadata: {
      eventTitle: demoEvents.event5.eventTitle,
      ticketRef: demoRegistrations[8].ticketRef
    },
    lastWebhookId: "seed-webhook-leila-2",
    createdAt: isoOffset({ days: -3, hours: -4 }),
    updatedAt: isoOffset({ days: -3, hours: -3 })
  },
  {
    paymentId: "00000000-0000-4000-8000-000000005004",
    registrationId: "00000000-0000-4000-8000-000000002011",
    eventId: demoEvents.event6.eventId,
    participantId: "00000000-0000-4000-8000-000000000107",
    amount: 0,
    currency: "MAD",
    status: "FAILED",
    provider: "manual",
    providerSessionId: "seed-payment-session-nora-2",
    providerPaymentId: null,
    metadata: {
      eventTitle: demoEvents.event6.eventTitle
    },
    lastWebhookId: "seed-webhook-nora-2",
    createdAt: isoOffset({ days: -2, hours: -9 }),
    updatedAt: isoOffset({ days: -2, hours: -8 })
  }
];

async function upsertRegistration(client, registration) {
  const { rows } = await client.query(
    `
      INSERT INTO registrations (
        registration_id,
        event_id,
        participant_id,
        participant_name,
        participant_email,
        event_title,
        event_city,
        event_start_at,
        event_capacity,
        registration_status,
        waitlist_position,
        ticket_id,
        ticket_ref,
        created_at,
        updated_at,
        cancelled_at,
        promoted_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17
      )
      ON CONFLICT (registration_id) DO UPDATE
      SET event_id = EXCLUDED.event_id,
          participant_id = EXCLUDED.participant_id,
          participant_name = EXCLUDED.participant_name,
          participant_email = EXCLUDED.participant_email,
          event_title = EXCLUDED.event_title,
          event_city = EXCLUDED.event_city,
          event_start_at = EXCLUDED.event_start_at,
          event_capacity = EXCLUDED.event_capacity,
          registration_status = EXCLUDED.registration_status,
          waitlist_position = EXCLUDED.waitlist_position,
          ticket_id = EXCLUDED.ticket_id,
          ticket_ref = EXCLUDED.ticket_ref,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          cancelled_at = EXCLUDED.cancelled_at,
          promoted_at = EXCLUDED.promoted_at
      RETURNING registration_id
    `,
    [
      registration.registrationId,
      registration.eventId,
      registration.participantId,
      registration.participantName,
      registration.participantEmail,
      registration.eventTitle,
      registration.eventCity,
      registration.eventStartAt,
      registration.eventCapacity,
      registration.registrationStatus,
      registration.waitlistPosition,
      registration.ticketId,
      registration.ticketRef,
      registration.createdAt,
      registration.updatedAt,
      registration.cancelledAt,
      registration.promotedAt
    ]
  );
  return rows[0];
}

async function upsertTicket(client, ticket) {
  const { rows } = await client.query(
    `
      INSERT INTO tickets (
        ticket_id,
        registration_id,
        event_id,
        participant_id,
        ticket_ref,
        ticket_format,
        ticket_status,
        payload,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10
      )
      ON CONFLICT (registration_id) DO UPDATE
      SET registration_id = EXCLUDED.registration_id,
          event_id = EXCLUDED.event_id,
          participant_id = EXCLUDED.participant_id,
          ticket_ref = EXCLUDED.ticket_ref,
          ticket_format = EXCLUDED.ticket_format,
          ticket_status = EXCLUDED.ticket_status,
          payload = EXCLUDED.payload,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      RETURNING ticket_id
    `,
    [
      ticket.ticketId,
      ticket.registrationId,
      ticket.eventId,
      ticket.participantId,
      ticket.ticketRef,
      ticket.ticketFormat,
      ticket.ticketStatus,
      JSON.stringify(ticket.payload),
      ticket.createdAt,
      ticket.updatedAt
    ]
  );
  return rows[0];
}

async function upsertNotification(client, notification) {
  const { rows } = await client.query(
    `
      INSERT INTO notifications (
        notification_id,
        recipient_id,
        recipient_role,
        event_id,
        registration_id,
        notification_type,
        title,
        message,
        metadata,
        is_read,
        created_at,
        read_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12
      )
      ON CONFLICT (notification_id) DO UPDATE
      SET recipient_id = EXCLUDED.recipient_id,
          recipient_role = EXCLUDED.recipient_role,
          event_id = EXCLUDED.event_id,
          registration_id = EXCLUDED.registration_id,
          notification_type = EXCLUDED.notification_type,
          title = EXCLUDED.title,
          message = EXCLUDED.message,
          metadata = EXCLUDED.metadata,
          is_read = EXCLUDED.is_read,
          created_at = EXCLUDED.created_at,
          read_at = EXCLUDED.read_at
      RETURNING notification_id
    `,
    [
      notification.notificationId,
      notification.recipientId,
      notification.recipientRole,
      notification.eventId,
      notification.registrationId,
      notification.notificationType,
      notification.title,
      notification.message,
      JSON.stringify(notification.metadata || {}),
      notification.isRead,
      notification.createdAt,
      notification.readAt
    ]
  );
  return rows[0];
}

async function upsertPayment(client, payment) {
  const { rows } = await client.query(
    `
      INSERT INTO payments (
        payment_id,
        registration_id,
        event_id,
        participant_id,
        amount,
        currency,
        status,
        provider,
        provider_session_id,
        provider_payment_id,
        metadata,
        last_webhook_id,
        created_at,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14
      )
      ON CONFLICT (payment_id) DO UPDATE
      SET registration_id = EXCLUDED.registration_id,
          event_id = EXCLUDED.event_id,
          participant_id = EXCLUDED.participant_id,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status,
          provider = EXCLUDED.provider,
          provider_session_id = EXCLUDED.provider_session_id,
          provider_payment_id = EXCLUDED.provider_payment_id,
          metadata = EXCLUDED.metadata,
          last_webhook_id = EXCLUDED.last_webhook_id,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at
      RETURNING payment_id
    `,
    [
      payment.paymentId,
      payment.registrationId,
      payment.eventId,
      payment.participantId,
      payment.amount,
      payment.currency,
      payment.status,
      payment.provider,
      payment.providerSessionId,
      payment.providerPaymentId,
      JSON.stringify(payment.metadata || {}),
      payment.lastWebhookId,
      payment.createdAt,
      payment.updatedAt
    ]
  );
  return rows[0];
}

async function fetchCounts(pool) {
  const { rows } = await pool.query(`
    SELECT 'notifications' AS table_name, count(*)::int AS count FROM notifications
    UNION ALL
    SELECT 'payments' AS table_name, count(*)::int AS count FROM payments
    UNION ALL
    SELECT 'registrations' AS table_name, count(*)::int AS count FROM registrations
    UNION ALL
    SELECT 'tickets' AS table_name, count(*)::int AS count FROM tickets
    ORDER BY table_name
  `);
  return rows;
}

async function main() {
  const pool = new Pool({
    connectionString: config.databaseUrl
  });

  try {
    await ensureSchema(pool);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const registration of demoRegistrations) {
        await upsertRegistration(client, registration);
      }

      for (const ticket of demoTickets) {
        await upsertTicket(client, ticket);
      }

      for (const notification of demoNotifications) {
        await upsertNotification(client, notification);
      }

      for (const payment of demoPayments) {
        await upsertPayment(client, payment);
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const counts = await fetchCounts(pool);

    console.log("Registration seed completed.");
    console.log(`Database target: ${describeDatabaseTarget(config.databaseUrl)}`);
    for (const registration of demoRegistrations) {
      console.log(
        `- ${registration.eventTitle} | ${registration.participantName} | ${registration.registrationStatus}`
      );
    }
    console.log("Row counts:");
    for (const row of counts) {
      console.log(`- ${row.table_name}: ${row.count}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error("Registration seed failed.");
  console.error(error);
  process.exit(1);
});
