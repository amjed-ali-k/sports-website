import { drizzle } from 'drizzle-orm/d1';
import { admins } from "@sports/database/schema";
import * as bcrypt from "bcryptjs";

// This script is meant to be run with wrangler
declare const DB: D1Database;

async function setupDatabase() {
  // Create Drizzle D1 instance
  const db = drizzle(DB);

  try {
    // Check if admin exists
    const existingAdmins = await db.select().from(admins).limit(1).all();
    if (existingAdmins.length > 0) {
      console.log("Admin already exists");
      return;
    }

    // Create initial admin
    const hashedPassword = await bcrypt.hash("admin123", 10);
    const admin = await db
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
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

// This script will be run through wrangler
export default setupDatabase;
