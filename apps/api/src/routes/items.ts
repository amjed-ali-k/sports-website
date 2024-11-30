import { z } from "zod";
import { items } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createItemSchema = z.object({
  name: z.string().min(1),
  categoryId: z.number(),
  isGroup: z.boolean(),
  gender: z.enum(["male", "female", "any"]),
  pointsFirst: z.number(),
  pointsSecond: z.number(),
  pointsThird: z.number(),
});

const router = hono()
  .post("/", zodValidator(createItemSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const item = await db.insert(items).values(data).returning().get();
    return c.json(item, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");
    const allItems = await db.select().from(items).all();
    return c.json(allItems);
  })
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const db = c.get("db");

    const item = await db.select().from(items).where(eq(items.id, id)).get();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json(item);
  });

export default router;
