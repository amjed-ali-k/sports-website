import { z } from "zod";
import { items, events } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  pointsFirst: z.number().min(0),
  pointsSecond: z.number().min(0),
  maxParticipants: z.number().min(1).optional().default(1),
  eventId: z.number(),
  gender: z.enum(["male", "female", "any"]),
  pointsThird: z.number().min(0),
  iconName: z.string().nullish()
});

const updateItemSchema = z.object({
  name: z.string().min(1).optional(),
  eventId: z.number().optional(),
  maxParticipants: z.number().min(1).optional().nullable(),
  description: z.string().optional().nullable(),
  pointsFirst: z.number().min(0).optional(),
  pointsSecond: z.number().min(0).optional(),
  pointsThird: z.number().min(0).optional(),
  canRegister: z.number().optional(),
  iconName: z.string().nullish(),
  status: z.enum(["scheduled", "on-going", "finished"]).optional(),
});

const router = hono()
  .post("/", zodValidator(createItemSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if category exists
    const category = await db
      .select()
      .from(events)
      .where(eq(events.id, data.eventId))
      .get();

    if (!category) {
      return c.json({ error: "Category not found" }, 404);
    }

    const item = await db.insert(items).values(data).returning().get();
    return c.json(item, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");

    const allItems = await db
      .select({
        item: items,
        category: {
          id: events.id,
          name: events.name,
        },
      })
      .from(items)
      .innerJoin(events, eq(items.eventId, events.id))
      .all();

    return c.json(allItems);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const item = await db
      .select({
        item: items,
        category: {
          id: events.id,
          name: events.name,
        },
      })
      .from(items)
      .where(eq(items.id, id))
      .innerJoin(events, eq(items.eventId, events.id))
      .get();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json(item);
  })
  .put("/:id", zodValidator(updateItemSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if item exists
    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .get();

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }
    if (data.eventId) {
      // Check if category exists
      const category = await db
        .select()
        .from(events)
        .where(eq(events.id, data.eventId))
        .get();

      if (!category) {
        return c.json({ error: "Category not found" }, 404);
      }
    }

    const updatedItem = await db
      .update(items)
      .set(data)
      .where(eq(items.id, id))
      .returning()
      .get();

    return c.json(updatedItem);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if item exists
    const existingItem = await db
      .select()
      .from(items)
      .where(eq(items.id, id))
      .get();

    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }

    // TODO: You might want to check if item has any registrations
    // and handle that case appropriately (either prevent deletion or cascade delete)

    await db.delete(items).where(eq(items.id, id));
    return c.json({ success: true });
  });

export default router;
