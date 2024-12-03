import { z } from "zod";
import { admins } from "@sports/database";
import { desc, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";
import bcrypt from "bcryptjs";

const updateAdminSchema = z.object({
  role: z.enum(["rep", "manager", "controller", "super_admin"]),
  description: z.string().nullish(),
  name: z.string().min(1).optional(),
});

const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  role: z.enum(["rep", "manager", "controller", "super_admin"]),
  organizationId: z.number().int().min(1),
  description: z.string().nullish(),
});

const router = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allAdmins = await db.select().from(admins).all();
    return c.json(allAdmins);
  })
  .post("/", zodValidator(createAdminSchema), async (c) => {
    const { email, password, name, role, description, organizationId } =
      c.req.valid("json");
    const db = c.get("db");

    // Check if admin with same email exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .get();

    if (existingAdmin) {
      return c.json({ error: "Admin with this email already exists" }, 400);
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const admin = await db
      .insert(admins)
      .values({
        email,
        password: hashedPassword,
        name,
        role,
        description,
        organizationId,
      })
      .returning()
      .get();

    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;
    return c.json(adminWithoutPassword, 201);
  })
  .put("/:id", zodValidator(updateAdminSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const body = c.req.valid("json");
    const db = c.get("db");

    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .get();

    if (!existingAdmin) {
      return c.json({ error: "Admin not found" }, 404);
    }

    // Update admin role
    const updatedAdmin = await db
      .update(admins)
      .set(body)
      .where(eq(admins.id, id))
      .returning()
      .get();

    return c.json(updatedAdmin);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if admin exists
    const existingAdmin = await db
      .select()
      .from(admins)
      .where(eq(admins.id, id))
      .get();

    if (!existingAdmin) {
      return c.json({ error: "Admin not found" }, 404);
    }

    // Don't allow deleting the last admin
    const adminCount = await db.select().from(admins).all();
    if (adminCount.length <= 1) {
      return c.json({ error: "Cannot delete the last admin" }, 400);
    }

    await db.delete(admins).where(eq(admins.id, id));
    return c.json({ success: true });
  });

export default router;
