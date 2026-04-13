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

const demoEvents = [
  {
    eventId: "00000000-0000-4000-8000-000000001001",
    organizerId: "00000000-0000-4000-8000-000000000102",
    title: "Casablanca Product Summit",
    description:
      "A future-facing product and delivery meetup for organizer teams and launch-minded participants.",
    theme: "Product",
    venueName: "Marina Conference Center",
    city: "Casablanca",
    startAt: isoOffset({ days: 12, hours: 9 }),
    endAt: isoOffset({ days: 12, hours: 16 }),
    timezone: "Africa/Casablanca",
    capacity: 120,
    visibility: "PUBLIC",
    pricingType: "PAID",
    status: "PUBLISHED",
    coverImageRef: "/images/event-media-demo.svg",
    publishedAt: isoOffset({ days: -2 }),
    createdAt: isoOffset({ days: -21 }),
    updatedAt: isoOffset({ days: -1 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001002",
    organizerId: "00000000-0000-4000-8000-000000000103",
    title: "Rabat Open Tech Night",
    description:
      "A community evening focused on engineering, design, and building dependable event systems.",
    theme: "Technology",
    venueName: "Hassan Business Hall",
    city: "Rabat",
    startAt: isoOffset({ days: 18, hours: 18 }),
    endAt: isoOffset({ days: 18, hours: 21 }),
    timezone: "Africa/Casablanca",
    capacity: 80,
    visibility: "PUBLIC",
    pricingType: "FREE",
    status: "PUBLISHED",
    coverImageRef: "/images/event-media-demo.svg",
    publishedAt: isoOffset({ days: -4 }),
    createdAt: isoOffset({ days: -25 }),
    updatedAt: isoOffset({ days: -2 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001003",
    organizerId: "00000000-0000-4000-8000-000000000102",
    title: "Marrakech Organizer Workshop",
    description:
      "A draft workshop for event organizers covering registration flows and dashboard polish.",
    theme: "Operations",
    venueName: "Atlas Studio",
    city: "Marrakech",
    startAt: isoOffset({ days: 27, hours: 10 }),
    endAt: isoOffset({ days: 27, hours: 13 }),
    timezone: "Africa/Casablanca",
    capacity: 40,
    visibility: "PRIVATE",
    pricingType: "FREE",
    status: "DRAFT",
    coverImageRef: null,
    publishedAt: null,
    createdAt: isoOffset({ days: -10 }),
    updatedAt: isoOffset({ days: -1 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001004",
    organizerId: "00000000-0000-4000-8000-000000000103",
    title: "Tangier Community Sprint Review",
    description:
      "An archived community sprint review kept for lifecycle and admin visibility demos.",
    theme: "Community",
    venueName: "Tangier Harbor Club",
    city: "Tangier",
    startAt: isoOffset({ days: -9, hours: 14 }),
    endAt: isoOffset({ days: -9, hours: 17 }),
    timezone: "Africa/Casablanca",
    capacity: 60,
    visibility: "PUBLIC",
    pricingType: "PAID",
    status: "CANCELLED",
    coverImageRef: null,
    publishedAt: isoOffset({ days: -20 }),
    createdAt: isoOffset({ days: -30 }),
    updatedAt: isoOffset({ days: -3 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001005",
    organizerId: "00000000-0000-4000-8000-000000000102",
    title: "Fez Creator Meetup",
    description:
      "A public meetup with a lighter, community-first agenda for creators and organizers.",
    theme: "Community",
    venueName: "Fez Innovation Hub",
    city: "Fez",
    startAt: isoOffset({ days: 22, hours: 15 }),
    endAt: isoOffset({ days: 22, hours: 18 }),
    timezone: "Africa/Casablanca",
    capacity: 150,
    visibility: "PUBLIC",
    pricingType: "FREE",
    status: "PUBLISHED",
    coverImageRef: null,
    publishedAt: isoOffset({ days: -5 }),
    createdAt: isoOffset({ days: -18 }),
    updatedAt: isoOffset({ days: -1, hours: -4 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001006",
    organizerId: "00000000-0000-4000-8000-000000000103",
    title: "Casablanca Internal Organizer Retro",
    description:
      "A private internal draft used to exercise organizer-only flows and hidden catalog states.",
    theme: "Operations",
    venueName: "Central Ops Room",
    city: "Casablanca",
    startAt: isoOffset({ days: 30, hours: 11 }),
    endAt: isoOffset({ days: 30, hours: 12 }),
    timezone: "Africa/Casablanca",
    capacity: 25,
    visibility: "PRIVATE",
    pricingType: "FREE",
    status: "DRAFT",
    coverImageRef: null,
    publishedAt: null,
    createdAt: isoOffset({ days: -7 }),
    updatedAt: isoOffset({ days: -2 }),
    deletedAt: null
  },
  {
    eventId: "00000000-0000-4000-8000-000000001007",
    organizerId: "00000000-0000-4000-8000-000000000102",
    title: "Agadir Archived Showcase",
    description:
      "A soft-deleted showcase row kept around to exercise archive and cleanup edge cases.",
    theme: "Archive",
    venueName: "Agadir Bay Hall",
    city: "Agadir",
    startAt: isoOffset({ days: -12, hours: 13 }),
    endAt: isoOffset({ days: -12, hours: 16 }),
    timezone: "Africa/Casablanca",
    capacity: 70,
    visibility: "PRIVATE",
    pricingType: "PAID",
    status: "CANCELLED",
    coverImageRef: null,
    publishedAt: isoOffset({ days: -25 }),
    createdAt: isoOffset({ days: -40 }),
    updatedAt: isoOffset({ days: -6 }),
    deletedAt: isoOffset({ days: -1 })
  }
];

async function upsertEvent(client, event) {
  const { rows } = await client.query(
    `
      INSERT INTO events (
        event_id,
        organizer_id,
        title,
        description,
        theme,
        venue_name,
        city,
        start_at,
        end_at,
        timezone,
        capacity,
        visibility,
        pricing_type,
        status,
        cover_image_ref,
        published_at,
        created_at,
        updated_at,
        deleted_at
      )
      VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19
      )
      ON CONFLICT (event_id) DO UPDATE
      SET organizer_id = EXCLUDED.organizer_id,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          theme = EXCLUDED.theme,
          venue_name = EXCLUDED.venue_name,
          city = EXCLUDED.city,
          start_at = EXCLUDED.start_at,
          end_at = EXCLUDED.end_at,
          timezone = EXCLUDED.timezone,
          capacity = EXCLUDED.capacity,
          visibility = EXCLUDED.visibility,
          pricing_type = EXCLUDED.pricing_type,
          status = EXCLUDED.status,
          cover_image_ref = EXCLUDED.cover_image_ref,
          published_at = EXCLUDED.published_at,
          created_at = EXCLUDED.created_at,
          updated_at = EXCLUDED.updated_at,
          deleted_at = EXCLUDED.deleted_at
      RETURNING event_id, status
    `,
    [
      event.eventId,
      event.organizerId,
      event.title,
      event.description,
      event.theme,
      event.venueName,
      event.city,
      event.startAt,
      event.endAt,
      event.timezone,
      event.capacity,
      event.visibility,
      event.pricingType,
      event.status,
      event.coverImageRef,
      event.publishedAt,
      event.createdAt,
      event.updatedAt,
      event.deletedAt
    ]
  );
  return rows[0];
}

async function fetchCounts(pool) {
  const { rows } = await pool.query(`
    SELECT 'events' AS table_name, count(*)::int AS count FROM events
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
      for (const event of demoEvents) {
        await upsertEvent(client, event);
      }
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const counts = await fetchCounts(pool);

    console.log("Event seed completed.");
    console.log(`Database target: ${describeDatabaseTarget(config.databaseUrl)}`);
    for (const event of demoEvents) {
      console.log(`- ${event.title} | ${event.city} | ${event.status} | ${event.visibility}`);
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
  console.error("Event seed failed.");
  console.error(error);
  process.exit(1);
});
