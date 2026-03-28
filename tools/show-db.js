import pg from 'pg';

const CONNECTION_STRING = "postgresql://postgres:postgres@localhost:55432/evenements_s1_m01";

async function show() {
  const pool = new pg.Pool({ connectionString: CONNECTION_STRING });
  try {
    const client = await pool.connect();
    
    console.log("\n--- AUTH_USERS ---");
    const users = await client.query("SELECT user_id, email, display_name, role FROM auth_users ORDER BY created_at DESC LIMIT 10");
    console.table(users.rows);

    console.log("\n--- EVENTS ---");
    const events = await client.query("SELECT event_id, title, city, status FROM events ORDER BY created_at DESC LIMIT 10");
    console.table(events.rows);

    console.log("\n--- REGISTRATIONS ---");
    const regs = await client.query("SELECT registration_id, event_title, participant_email, registration_status FROM registrations ORDER BY created_at DESC LIMIT 10");
    console.table(regs.rows);

    client.release();
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

show();
