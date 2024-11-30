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

const updateResultSchema = z.object({
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
    return c.json(result, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");
    const allResults = await db.select().from(results).all();
    return c.json(allResults);
  })
  .get("/item/:itemId", async (c) => {
    const itemId = Number(c.req.param("itemId"));
    const db = c.get("db");

    const itemResults = await db
      .select({
        id: results.id,
        itemId: results.itemId,
        position: results.position,
        registrationId: results.registrationId,
        points: results.points,
        createdAt: results.createdAt,
        updatedAt: results.updatedAt,
        participant: {
          id: participants.id,
          fullName: participants.fullName,
          chestNo: participants.chestNo,
          sectionId: participants.sectionId,
        },
      })
      .from(results)
      .where(eq(results.itemId, itemId))
      .innerJoin(registrations, eq(results.registrationId, registrations.id))
      .innerJoin(participants, eq(registrations.participantId, participants.id))
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
  })
  .put("/:id", zodValidator(updateResultSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if result exists
    const existingResult = await db
      .select()
      .from(results)
      .where(eq(results.id, id))
      .get();

    if (!existingResult) {
      return c.json({ error: "Result not found" }, 404);
    }

    // Check if registration exists
    const registration = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, data.registrationId))
      .get();

    if (!registration) {
      return c.json({ error: "Registration not found" }, 404);
    }

    // Check if position is already taken by another result
    const positionTaken = await db
      .select()
      .from(results)
      .where(
        and(
          eq(results.itemId, existingResult.itemId),
          eq(results.position, data.position),
          sql`${results.id} != ${id}`
        )
      )
      .get();

    if (positionTaken) {
      return c.json(
        { error: "Position already taken for this item" },
        400
      );
    }

    const updatedResult = await db
      .update(results)
      .set(data)
      .where(eq(results.id, id))
      .returning()
      .get();

    return c.json(updatedResult);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if result exists
    const existingResult = await db
      .select()
      .from(results)
      .where(eq(results.id, id))
      .get();

    if (!existingResult) {
      return c.json({ error: "Result not found" }, 404);
    }

    await db.delete(results).where(eq(results.id, id));
    return c.json({ success: true });
  });

export default router;
