import pg from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const CONNECTION_STRING = "postgresql://postgres:postgres@localhost:55432/evenements_s1_m01";

async function seed() {
  const pool = new pg.Pool({
    connectionString: CONNECTION_STRING,
  });

  try {
    console.log("Connecting to database...");
    const client = await pool.connect();

    // 1. Clear existing data (Optional but helpful for clean state)
    console.log("Cleaning up old data...");
    await client.query("DELETE FROM registrations");
    await client.query("DELETE FROM events");
    await client.query("DELETE FROM auth_users WHERE email != 'admin@example.com'");

    const passwordHash = await bcrypt.hash("password123", 10);
    const now = new Date();

    // 2. Create Organizers
    console.log("Creating organizers...");
    const organizer1Id = crypto.randomUUID();
    const organizer2Id = crypto.randomUUID();

    await client.query(
      "INSERT INTO auth_users (user_id, email, password_hash, display_name, full_name, role, account_status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [organizer1Id, "organizer1@example.com", passwordHash, "Organizer One", "Alpha Organizer", "ORGANIZER", "ACTIVE", now, now]
    );
    await client.query(
      "INSERT INTO auth_users (user_id, email, password_hash, display_name, full_name, role, account_status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [organizer2Id, "organizer2@example.com", passwordHash, "Organizer Two", "Beta Organizer", "ORGANIZER", "ACTIVE", now, now]
    );

    // 3. Create Participants
    console.log("Creating participants...");
    const participantIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    const participantEmails = ["user1@example.com", "user2@example.com", "user3@example.com"];

    for (let i = 0; i < 3; i++) {
      await client.query(
        "INSERT INTO auth_users (user_id, email, password_hash, display_name, full_name, role, account_status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)",
        [participantIds[i], participantEmails[i], passwordHash, `User ${i+1}`, `Participant ${i+1}`, "PARTICIPANT", "ACTIVE", now, now]
      );
    }

    // 4. Create Events
    console.log("Creating events...");
    const eventIds = [crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID(), crypto.randomUUID()];
    const eventData = [
      { id: eventIds[0], org: organizer1Id, title: "Modern Web Expo 2026", city: "Casablanca", status: "PUBLISHED", cap: 100 },
      { id: eventIds[1], org: organizer1Id, title: "AI Summit Morocco", city: "Rabat", status: "PUBLISHED", cap: 50 },
      { id: eventIds[2], org: organizer2Id, title: "Cloud Architecture Workshop", city: "Marrakech", status: "PUBLISHED", cap: 30 },
      { id: eventIds[3], org: organizer2Id, title: "Cybersecurity Drill", city: "Tangier", status: "DRAFT", cap: 20 },
      { id: eventIds[4], org: organizer1Id, title: "DevOps Days Local", city: "Casablanca", status: "DRAFT", cap: 40 }
    ];

    for (const event of eventData) {
      await client.query(
        `INSERT INTO events (
          event_id, organizer_id, title, description, theme, venue_name, city, 
          start_at, timezone, capacity, visibility, pricing_type, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          event.id, event.org, event.title, `Description for ${event.title}`, "Technology", 
          "Main Hall", event.city, new Date(Date.now() + 86400000 * 7), "UTC", 
          event.cap, "PUBLIC", "FREE", event.status, now, now
        ]
      );
    }

    // 5. Create Registrations
    console.log("Creating registrations...");
    // Register all participants for the first event
    for (let i = 0; i < 3; i++) {
        const regId = crypto.randomUUID();
        await client.query(
            `INSERT INTO registrations (
                registration_id, event_id, participant_id, participant_name, participant_email, 
                event_title, event_city, event_start_at, event_capacity, registration_status, 
                created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
                regId, eventIds[0], participantIds[i], `User ${i+1}`, participantEmails[i],
                eventData[0].title, eventData[0].city, new Date(Date.now() + 86400000 * 7), 100, "CONFIRMED",
                now, now
            ]
        );
    }

    // Register some for the second event
    await client.query(
        `INSERT INTO registrations (
            registration_id, event_id, participant_id, participant_name, participant_email, 
            event_title, event_city, event_start_at, event_capacity, registration_status, 
            created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
            crypto.randomUUID(), eventIds[1], participantIds[0], `User 1`, participantEmails[0],
            eventData[1].title, eventData[1].city, new Date(Date.now() + 86400000 * 7), 50, "WAITLISTED",
            now, now
        ]
    );

    console.log("Seeding completed successfully!");
    client.release();
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await pool.end();
  }
}

seed();
