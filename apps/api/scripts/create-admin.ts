import { drizzle } from "drizzle-orm/d1";
import { admins } from "@sports/database/schema";
import * as bcrypt from "bcryptjs";

async function createAdmin(db: D1Database) {
  const drizzleDb = drizzle(db);

  // Check if any admin exists
  const existingAdmins = await drizzleDb.select().from(admins).limit(1);
  if (existingAdmins.length > 0) {
    console.log("Admin already exists");
    return;
  }

  // Create initial admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const [admin] = await drizzleDb
    .insert(admins)
    .values({
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin",
      role: "controller",
    })
    .returning();

  console.log("Created admin:", {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
}

export default createAdmin;
