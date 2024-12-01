import { eq, and, ne } from "drizzle-orm";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import { admins } from "@sports/database/schema";
import bcrypt from "bcryptjs";
import { hono, zodValidator } from "../lib/api";

const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string(),
  role: z.enum(["rep", "manager", "controller"]),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const auth = hono()
  .post("/login", zodValidator(loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const admin = await c
      .get("db")
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .get();

    if (!admin) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return c.json({ message: "Invalid credentials" }, 401);
    }

    // Token expires in 24 hours
    const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

    console.log("Admin logged in:", {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    const token = await sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        exp,
      },
      c.env.JWT_SECRET
    );

    return c.json({ token });
  })
  .post("/setup", zodValidator(createAdminSchema), async (c) => {
    // Only allow setup if no admins exist
    const existingAdmins = await c.get("db").select().from(admins).limit(1);
    if (existingAdmins.length > 0) {
      return c.json({ message: "Setup already completed" }, 400);
    }

    const { email, password, name, role } = c.req.valid("json");

    // Only allow creating controller during setup
    if (role !== "controller") {
      return c.json({ message: "Initial admin must be a controller" }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [admin] = await c
      .get("db")
      .insert(admins)
      .values({
        email,
        password: hashedPassword,
        name,
        role,
      })
      .returning();

    return c.json({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  })
  .post("/logout", async (c) => {
    // Since we're using JWT, we don't need to do anything server-side
    // The client will handle removing the token
    return c.json({ message: "Logged out successfully" });
  })
  .get("/me", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    try {
      const payload = await verify(token, c.env.JWT_SECRET);
      return c.json(payload);
    } catch {
      return c.json({ message: "Invalid token" }, 401);
    }
  })
  .put("/profile", zodValidator(updateProfileSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");
    const { id: userId } = c.get("user");

    // Check if email is already taken by another user
    const existingUser = await db
      .select()
      .from(admins)
      .where(and(eq(admins.email, data.email), ne(admins.id, userId)))
      .get();

    if (existingUser) {
      return c.json({ error: "Email already taken" }, 400);
    }

    const user = await db
      .update(admins)
      .set({
        name: data.fullName,
        email: data.email,
      })
      .where(eq(admins.id, userId))
      .returning()
      .get();

    return c.json(user);
  })
  .put("/password", zodValidator(updatePasswordSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");
    const { id: userId } = c.get("user");

    const user = await db
      .select()
      .from(admins)
      .where(eq(admins.id, userId))
      .get();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValid) {
      return c.json({ error: "Current password is incorrect" }, 400);
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await db
      .update(admins)
      .set({ password: hashedPassword })
      .where(eq(admins.id, userId))
      .run();

    return c.json({ message: "Password updated successfully" });
  });

export default auth;
