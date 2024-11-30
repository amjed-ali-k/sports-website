import { Database } from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as bcrypt from "bcryptjs";
import { admins } from "@sports/database/schema";

async function setupDatabase() {
  // Create SQLite database
  const sqlite = new Database("dev.db");
  const db = drizzle(sqlite);

  // Run migrations
  console.log("Running migrations...");
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations complete");

  // Check if admin exists
  const existingAdmins = db.select().from(admins).limit(1).all();
  if (existingAdmins.length > 0) {
    console.log("Admin already exists");
    return;
  }

  // Create initial admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = db
    .insert(admins)
    .values({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin",
      role: "controller",
    })
    .returning()
    .get();

  console.log("Created admin:", {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  console.log("\nInitial admin credentials:");
  console.log("Email: admin@example.com");
  console.log("Password: admin123");
}

setupDatabase().catch(console.error);
