import { events } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono } from "../lib/api";


const router = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allCategories = await db.select().from(events).all();
    return c.json(allCategories);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const event = await db.select().from(events).where(eq(events.id, id)).get();

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json(event);
  });

export default router;
