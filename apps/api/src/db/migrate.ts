import { drizzle } from "drizzle-orm/d1";
import { migrate } from "drizzle-orm/d1/migrator";

export default async function runMigrations(db: D1Database) {
  const drizzleDb = drizzle(db);

  console.log("Running migrations...");
  await migrate(drizzleDb, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete");

  console.log("Setup complete");
}
