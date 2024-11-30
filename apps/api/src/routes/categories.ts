import { z } from "zod";
import { categories } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createCategorySchema = z.object({
  name: z.enum(["sports", "games", "arts"]),
});

const router = hono()
  .post("/", zodValidator(createCategorySchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const category = await db.insert(categories).values(data).returning().get();
    return c.json(category, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");
    const allCategories = await db.select().from(categories).all();
    return c.json(allCategories);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json(category);
  })
  .put("/:id", zodValidator(createCategorySchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    if (!existingCategory) {
      return c.json({ error: "Category not found" }, 404);
    }

    const updatedCategory = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning()
      .get();

    return c.json(updatedCategory);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if category exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    if (!existingCategory) {
      return c.json({ error: "Category not found" }, 404);
    }

    // TODO: You might want to check if category has any items
    // and handle that case appropriately (either prevent deletion or cascade delete)

    await db.delete(categories).where(eq(categories.id, id));
    return c.json({ success: true });
  });

export default router;
