import { drizzle } from 'drizzle-orm/d1';
import { admins } from "@sports/database/schema";
import * as bcrypt from "bcryptjs";

export interface Env {
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env) {
    const db = drizzle(env.DB);

    try {
      // Check if admin exists
      const existingAdmins = await db.select().from(admins).limit(1).all();
      if (existingAdmins.length > 0) {
        return new Response("Admin already exists", { status: 200 });
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

      return new Response(JSON.stringify({
        message: "Admin created successfully",
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error: any) {
      return new Response(JSON.stringify({
        error: "Failed to seed database",
        details: error.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
}
