import { admins, organizations } from "@sports/database";
import { and, eq, ne } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateProfileSchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    description: z.string().nullish(),
    avatar: z.string().nullish(),
  });
  
  const updatePasswordSchema = z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6),
  });

const updateOrganizationSchema = z.object({
    name: z.string().min(1),
    description: z.string().nullish(),
  });
  
const router = hono().put("/profile", zodValidator(updateProfileSchema), async (c) => {
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
        description: data.description,
        avatar: data.avatar,
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
  }).get("/organization", async (c) => {
    const db = c.get("db");
    const organizationId = c.get("user").organizationId;
    const organization = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .get();
    return c.json(organization);
  }).put("/organization", zodValidator(updateOrganizationSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");
    const organizationId = c.get("user").organizationId;
    const organization = await db
      .update(organizations)
      .set({
        name: data.name,
        description: data.description,
      })
      .where(eq(organizations.id, organizationId))
      .returning()
      .get();
      return c.json(organization);
  });

  export default router