import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { results, items, registrations, participants } from "@sports/database";
import { eq, and } from "drizzle-orm";

const router = new Hono<{
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    db: DrizzleD1Database;
  };
}>();

const createResultSchema = z.object({
  itemId: z.number(),
  position: z.enum(["first", "second", "third"]),
  registrationId: z.number(),
  points: z.number(),
});

router.post("/", zValidator("json", createResultSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.get("db");

  // Verify if item and registration exist
  const [item, registration] = await Promise.all([
    db.select().from(items).where(eq(items.id, data.itemId)).get(),
    db
      .select()
      .from(registrations)
      .where(eq(registrations.id, data.registrationId))
      .get(),
  ]);

  if (!item || !registration) {
    return c.json({ error: "Item or registration not found" }, 404);
  }

  // Check if result already exists for this position and item
  const existingResult = await db
    .select()
    .from(results)
    .where(
      and(eq(results.itemId, data.itemId), eq(results.position, data.position)),
    )
    .get();

  if (existingResult) {
    return c.json({ error: "Result already exists for this position" }, 400);
  }

  const result = await db.insert(results).values(data).returning().get();

  // Update registration status to participated
  await db
    .update(registrations)
    .set({ status: "participated" })
    .where(eq(registrations.id, data.registrationId))
    .run();

  return c.json(result, 201);
});

router.get("/item/:itemId", async (c) => {
  const itemId = parseInt(c.req.param("itemId"));
  const db = c.get("db");

  const itemResults = await db
    .select({
      result: results,
      registration: registrations,
      participant: participants,
    })
    .from(results)
    .leftJoin(registrations, eq(results.registrationId, registrations.id))
    .leftJoin(participants, eq(registrations.participantId, participants.id))
    .where(eq(results.itemId, itemId))
    .all();

  return c.json(itemResults);
});

router.get("/participant/:participantId", async (c) => {
  const participantId = parseInt(c.req.param("participantId"));
  const db = c.get("db");

  const participantResults = await db
    .select({
      result: results,
      registration: registrations,
      item: items,
    })
    .from(results)
    .leftJoin(registrations, eq(results.registrationId, registrations.id))
    .leftJoin(items, eq(results.itemId, items.id))
    .where(eq(registrations.participantId, participantId))
    .all();

  return c.json(participantResults);
});

router.get("/leaderboard", async (c) => {
  const db = c.get("db");

  const leaderboard = await db
    .select({
      participant: participants,
      totalPoints: sql<number>`SUM(${results.points})`.as("total_points"),
    })
    .from(results)
    .leftJoin(registrations, eq(results.registrationId, registrations.id))
    .leftJoin(participants, eq(registrations.participantId, participants.id))
    .groupBy(participants.id)
    .orderBy(sql`total_points DESC`)
    .all();

  return c.json(leaderboard);
});

export default router;
