import { z } from "zod";
import { sections } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createSectionSchema = z.object({
  name: z.string().min(1),
});

const router = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allSections = await db.select().from(sections).all();
    return c.json(allSections);
  })
  .post("/", zodValidator(createSectionSchema), async (c) => {
    const { name } = c.req.valid("json");
    const db = c.get("db");

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
      .values({ name })
      .returning()
      .get();

    return c.json(section, 201);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if section exists
    const existingSection = await db
      .select()
      .from(sections)
      .where(eq(sections.id, id))
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
