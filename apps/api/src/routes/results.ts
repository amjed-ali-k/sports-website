import { z } from "zod";
import { results, items, registrations, participants } from "@sports/database";
import { eq, and, sql } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createResultSchema = z.object({
  itemId: z.number(),
  position: z.enum(["first", "second", "third"]),
  registrationId: z.number(),
  points: z.number(),
});

const router = hono()
  .post("/", zodValidator(createResultSchema), async (c) => {
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

    // Check if result already exists
    const existingResult = await db
      .select()
      .from(results)
      .where(
        and(
          eq(results.itemId, data.itemId),
          eq(results.position, data.position)
        )
      )
      .get();

    if (existingResult) {
      return c.json(
        { error: "Position already taken for this item" },
        400
      );
    }

    const result = await db.insert(results).values(data).returning().get();

    // Update registration status
    await db
      .update(registrations)
      .set({ status: "participated" })
      .where(eq(registrations.id, data.registrationId))
      .run();

    return c.json(result, 201);
  })
  .get("/item/:itemId", async (c) => {
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
  })
  .get("/participant/:participantId", async (c) => {
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
  })
  .get("/leaderboard", async (c) => {
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
