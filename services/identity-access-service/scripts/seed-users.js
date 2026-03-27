import pg from "pg";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const databaseUrl = process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:55432/evenements_s1_m01";

async function seed() {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  const email = "admin@example.com";
  const password = "adminPassword123";
  const passwordHash = bcrypt.hashSync(password, 10);
  const userId = crypto.randomUUID();

  try {
    console.log(`Checking if user ${email} exists...`);
    const { rows } = await pool.query("SELECT * FROM auth_users WHERE email = $1", [email]);
    
    if (rows.length > 0) {
      console.log("User already exists. Updating password...");
      await pool.query(
        "UPDATE auth_users SET password_hash = $1, updated_at = NOW() WHERE email = $2",
        [passwordHash, email]
      );
    } else {
      console.log("Creating new admin user...");
      await pool.query(
        `INSERT INTO auth_users (
          user_id, email, password_hash, display_name, role, account_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [userId, email, passwordHash, "Admin User", "ORGANIZER", "ACTIVE"]
      );
    }
    console.log("-----------------------------------------");
    console.log("Credentials Created Successfully!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log("-----------------------------------------");
  } catch (err) {
    console.error("Failed to seed user:", err);
  } finally {
    await pool.end();
  }
}

seed();
