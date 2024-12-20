import { z } from "zod";
import { sections } from "@sports/database";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createSectionSchema = z.object({
  name: z.string().min(1),
  logo: z.string().nullish(),
  color: z.string().nullish(),
  description: z.string().nullish(),
  slug: z.string().min(1).max(3)
});

const updateSectionSchema = z.object({
  name: z.string().min(1).optional(),
  logo: z.string().nullish(),
  color: z.string().nullish(),
  description: z.string().nullish(),
  slug: z.string().min(1).max(3).nullish()
});

const router = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allSections = await db.select().from(sections).all();
    return c.json(allSections);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const section = await db
      .select()
      .from(sections)
      .where(eq(sections.id, id))
      .get();

    if (!section) {
      return c.json({ error: "Section not found" }, 404);
    }

    return c.json(section);
  })
  .post("/", zodValidator(createSectionSchema), async (c) => {
    const { name, logo, color, description, slug } = c.req.valid("json");
    const db = c.get("db");
    const organizationId = c.get("user").organizationId;
    // Check if section with same name exists
    const existingSection = await db
      .select()
      .from(sections)
      .where(eq(sections.name, name))
      .get();

    if (existingSection) {
      return c.json({ error: "Section already exists" }, 400);
    }

    const section = await db
      .insert(sections)
      .values({
        name,
        logo,
        color,
        description,
        organizationId,
        slug
      })
      .returning()
      .get();

    return c.json(section, 201);
  })
  .put("/:id", zodValidator(updateSectionSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if section exists
    const existingSection = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.id, id),
          eq(sections.organizationId, c.get("user").organizationId)
        )
      )
      .get();

    if (!existingSection) {
      return c.json({ error: "Section not found" }, 404);
    }

    const section = await db
      .update(sections)
      .set(data)
      .where(eq(sections.id, id))
      .returning()
      .get();

    return c.json(section);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if section exists
    const existingSection = await db
      .select()
      .from(sections)
      .where(
        and(
          eq(sections.id, id),
          eq(sections.organizationId, c.get("user").organizationId)
        )
      )
      .get();

    if (!existingSection) {
      return c.json({ error: "Section not found" }, 404);
    }

    // TODO: You might want to check if section has any participants
    // and handle that case appropriately (either prevent deletion or cascade delete)

    await db.delete(sections).where(eq(sections.id, id));
    return c.json({ success: true });
  });

export default router;
