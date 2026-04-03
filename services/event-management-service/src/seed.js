/**
 * EventOS — Event seed script
 * Inserts 10 realistic public events into the database.
 *
 * Usage (from project root, with backend running):
 *   cd services/event-management-service && node src/seed.js
 *
 * Or with a custom DB URL:
 *   DATABASE_URL=postgres://... node src/seed.js
 *
 * The script is idempotent — running it twice will not create duplicates.
 */

import pg from "pg";
import { ensureSchema } from "./db/schema.js";

const { Pool } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01";

// Fixed organizer UUID — a seed organizer that owns all demo events.
// No real user record is required since organizer_id has no FK constraint.
const SEED_ORGANIZER_ID = "a1b2c3d4-e5f6-4a7b-8c9d-e0f1a2b3c401";

const now = new Date("2026-04-01T10:00:00Z").toISOString();

const events = [
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000001",
    organizerId: SEED_ORGANIZER_ID,
    title: "Casablanca Tech Summit 2026",
    description:
      "Join over 500 tech professionals, startup founders, and investors for the largest technology conference in North Africa. Two full days of keynotes, hands-on workshops, and networking sessions covering artificial intelligence, fintech, e-commerce, and the future of digital infrastructure in the MENA region. Confirmed speakers include CTOs from leading Moroccan and international tech companies.",
    theme: "Technology",
    venueName: "Casablanca Finance City Tower",
    city: "Casablanca",
    startAt: "2026-05-15T09:00:00Z",
    endAt: "2026-05-16T18:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 500,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 1500,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000002",
    organizerId: SEED_ORGANIZER_ID,
    title: "Marrakech Atlas Jazz Festival",
    description:
      "Three magical nights of live jazz performances set against the backdrop of the historic Palais El Badi in the heart of Marrakech. The festival brings together internationally acclaimed jazz musicians alongside emerging Moroccan talent, celebrating the cross-cultural dialogue between African, Arab, and Western musical traditions. Includes open-air concerts, jam sessions, and late-night rooftop performances.",
    theme: "Music",
    venueName: "Palais El Badi",
    city: "Marrakech",
    startAt: "2026-06-20T19:00:00Z",
    endAt: "2026-06-22T23:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 2000,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 800,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000003",
    organizerId: SEED_ORGANIZER_ID,
    title: "Startup Pitch Night — Rabat",
    description:
      "A high-energy evening where early-stage startup founders pitch their ideas live to a panel of seasoned investors and mentors. Each team gets five minutes to present followed by a Q&A round. Finalists compete for a prize package that includes funding introductions, six months of co-working space, and mentorship sessions. Open to all stages — from idea to pre-seed. Networking drinks follow the pitches.",
    theme: "Business",
    venueName: "StartupMaroc Hub, Hay Riad",
    city: "Rabat",
    startAt: "2026-04-18T18:00:00Z",
    endAt: "2026-04-18T22:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 150,
    visibility: "PUBLIC",
    pricingType: "FREE",
    price: 0,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000004",
    organizerId: SEED_ORGANIZER_ID,
    title: "Fès Medina Photography Workshop",
    description:
      "A guided photography walk through the UNESCO-listed ancient medina of Fès led by award-winning documentary photographer Karim Benali. Explore the tanneries, the souks, and the hidden courtyards of one of the world's best-preserved medieval cities. The workshop covers composition, natural light, and storytelling through street photography. All skill levels welcome — participants keep the rights to their work.",
    theme: "Arts",
    venueName: "Bab Bou Jeloud, Médina de Fès",
    city: "Fès",
    startAt: "2026-05-03T07:00:00Z",
    endAt: "2026-05-03T12:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 20,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 650,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000005",
    organizerId: SEED_ORGANIZER_ID,
    title: "Agadir Surf Open Championship",
    description:
      "Morocco's most anticipated surf competition returns to Agadir's world-famous beach break. Professional and amateur surfers from across Africa and Europe compete across three divisions: shortboard, longboard, and bodyboard. Free to spectate, with a festival atmosphere including live music, food stands, and beach volleyball. The event is sanctioned by the Moroccan Surfing Federation and doubles as a qualifier for regional championships.",
    theme: "Sports",
    venueName: "Plage d'Agadir — Secteur Balcon",
    city: "Agadir",
    startAt: "2026-06-07T08:00:00Z",
    endAt: "2026-06-08T17:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 300,
    visibility: "PUBLIC",
    pricingType: "FREE",
    price: 0,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000006",
    organizerId: SEED_ORGANIZER_ID,
    title: "Rabat International Book Fair",
    description:
      "The most prestigious literary event in Morocco returns for its 29th edition. Over 600 publishers from 45 countries fill the Parc des Expositions with hundreds of thousands of titles in Arabic, French, English, and Amazigh. The nine-day programme includes book signings, literary debates, readings for children, and a dedicated section for Moroccan authors and independent publishers. Admission is free — all are welcome.",
    theme: "Culture",
    venueName: "Parc des Expositions de Rabat",
    city: "Rabat",
    startAt: "2026-05-23T10:00:00Z",
    endAt: "2026-05-31T20:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 5000,
    visibility: "PUBLIC",
    pricingType: "FREE",
    price: 0,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000007",
    organizerId: SEED_ORGANIZER_ID,
    title: "Moroccan Gastronomy Masterclass",
    description:
      "A hands-on cooking experience led by Chef Nadia El Fassi inside the legendary riad kitchens of La Maison Arabe. Learn the art of preparing classic Moroccan dishes — bastilla, slow-cooked lamb tagine, and msemen with honey — using techniques passed down through generations. The class ends with a shared meal and includes a curated selection of Moroccan wines and mineral waters. Maximum 20 participants per session.",
    theme: "Food & Drink",
    venueName: "La Maison Arabe, Derb Assehbe",
    city: "Marrakech",
    startAt: "2026-04-19T09:00:00Z",
    endAt: "2026-04-19T13:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 20,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 1200,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000008",
    organizerId: SEED_ORGANIZER_ID,
    title: "Morocco AI & Innovation Forum",
    description:
      "A full-day summit bringing together AI researchers, product leaders, policymakers, and entrepreneurs to explore how artificial intelligence is reshaping industries across North Africa. Panel discussions cover healthcare AI, Arabic NLP, autonomous systems, and responsible AI governance. Workshops include hands-on sessions with large language models and computer vision tools. The forum closes with a live demo showcase from Moroccan AI startups.",
    theme: "Technology",
    venueName: "Hyatt Regency Casablanca, Place des Nations Unies",
    city: "Casablanca",
    startAt: "2026-06-12T08:00:00Z",
    endAt: "2026-06-12T18:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 350,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 1800,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000009",
    organizerId: SEED_ORGANIZER_ID,
    title: "Tanger International Film Festival",
    description:
      "Five days of international and Moroccan cinema in the city where Africa meets Europe. Screenings take place at the historic Cinéma Rif, open-air venues in the medina, and rooftop locations overlooking the Strait of Gibraltar. The programme includes feature films, short film competitions, retrospectives, and daily Q&A sessions with directors. The festival is free to the public and open to all ages.",
    theme: "Arts & Culture",
    venueName: "Cinéma Rif & Place du 9 Avril",
    city: "Tanger",
    startAt: "2026-07-04T17:00:00Z",
    endAt: "2026-07-08T22:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 800,
    visibility: "PUBLIC",
    pricingType: "FREE",
    price: 0,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  },
  {
    eventId: "a1b2c3d4-e5f6-4a7b-8c9d-000000000010",
    organizerId: SEED_ORGANIZER_ID,
    title: "Sahara Desert Wellness Retreat",
    description:
      "Four transformative days of yoga, meditation, and mindfulness practice in the heart of the Erg Chebbi dunes. Wake up to sunrise yoga on the sand, spend afternoons in guided breathwork and sound healing sessions, and gather around the fire each evening for shared storytelling and star gazing. Accommodation is in luxury desert tents with full board included. Limited to 25 participants to preserve the quality and intimacy of the experience.",
    theme: "Wellness",
    venueName: "Erg Chebbi Desert Camp",
    city: "Merzouga",
    startAt: "2026-05-09T14:00:00Z",
    endAt: "2026-05-12T11:00:00Z",
    timezone: "Africa/Casablanca",
    capacity: 25,
    visibility: "PUBLIC",
    pricingType: "PAID",
    price: 5500,
    currency: "MAD",
    status: "PUBLISHED",
    coverImageRef: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop&q=80",
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null
  }
];

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  try {
    console.log("Connecting to database...");
    await pool.query("SELECT 1");
    console.log("Connected.");

    console.log("Ensuring schema exists...");
    await ensureSchema(pool);
    console.log("Schema ready.");

    console.log(`\nInserting ${events.length} events...\n`);

    let inserted = 0;
    let skipped = 0;

    for (const event of events) {
      const { rowCount } = await pool.query(
        `
        INSERT INTO events (
          event_id, organizer_id, title, description, theme,
          venue_name, city, start_at, end_at, timezone,
          capacity, visibility, pricing_type, price, currency,
          status, cover_image_ref,
          published_at, created_at, updated_at, deleted_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17,
          $18, $19, $20, $21
        )
        ON CONFLICT (event_id) DO UPDATE SET
          price          = EXCLUDED.price,
          currency       = EXCLUDED.currency,
          cover_image_ref = EXCLUDED.cover_image_ref,
          updated_at     = EXCLUDED.updated_at
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
          event.price ?? 0,
          event.currency ?? "MAD",
          event.status,
          event.coverImageRef,
          event.publishedAt,
          event.createdAt,
          event.updatedAt,
          event.deletedAt
        ]
      );

      if (rowCount > 0) {
        console.log(`  ✓ ${event.title} (${event.city}) — MAD ${event.price ?? 0}`);
        inserted++;
      } else {
        console.log(`  — ${event.title} (${event.city}) — skipped`);
        skipped++;
      }
    }

    console.log(`\nDone. ${inserted} inserted, ${skipped} skipped.`);
    console.log("Events are now live in the public catalog.\n");
  } catch (error) {
    console.error("\nSeed failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
