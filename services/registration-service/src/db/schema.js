import { runner } from "node-pg-migrate";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(databaseUrl) {
  await runner({
    databaseUrl,
    dir: path.join(__dirname, "../../migrations"),
    direction: "up",
    migrationsTable: "pgmigrations_registration",
    verbose: true
  });
}
