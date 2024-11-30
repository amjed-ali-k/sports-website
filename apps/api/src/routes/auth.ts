import { eq } from "drizzle-orm";
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

const auth = hono()
  .post(
    "/login",
    zodValidator(loginSchema),
    async (c) => {
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

      const token = await sign(
        {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        c.env.JWT_SECRET
      );

      return c.json({ token });
    }
  )
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
  });

export default auth;
