import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { registrations, participants, items } from "@sports/database";
import { eq, and } from "drizzle-orm";
import { hono } from "../lib/api";

const createRegistrationSchema = z.object({
  itemId: z.number(),
  participantId: z.number(),
  groupId: z.number().optional(),
  metaInfo: z.string().optional(),
});

const updateRegistrationStatusSchema = z.object({
  status: z.enum(["registered", "participated", "not_participated"]),
});

const router = hono()
  .post("/", zValidator("json", createRegistrationSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if participant and item exist
    const [participant, item] = await Promise.all([
      db
        .select()
        .from(participants)
        .where(eq(participants.id, data.participantId))
        .get(),
      db.select().from(items).where(eq(items.id, data.itemId)).get(),
    ]);

    if (!participant || !item) {
      return c.json({ error: "Participant or item not found" }, 404);
    }

    // Check if registration already exists
    const existingRegistration = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.itemId, data.itemId),
          eq(registrations.participantId, data.participantId)
        )
      )
      .get();

    if (existingRegistration) {
      return c.json(
        { error: "Participant already registered for this item" },
        400
      );
    }

    const registration = await db
      .insert(registrations)
      .values(data)
      .returning()
      .get();

    return c.json(registration, 201);
  })
  .patch(
    "/:id/status",
    zValidator("json", updateRegistrationStatusSchema),
    async (c) => {
      const id = parseInt(c.req.param("id"));
      const { status } = c.req.valid("json");
      const db = c.get("db");

      const registration = await db
        .update(registrations)
        .set({ status })
        .where(eq(registrations.id, id))
        .returning()
        .get();

      if (!registration) {
        return c.json({ error: "Registration not found" }, 404);
      }

      return c.json(registration);
    }
  )
  .get("/item/:itemId", async (c) => {
    const itemId = parseInt(c.req.param("itemId"));
    const db = c.get("db");

    const itemRegistrations = await db
      .select({
        registration: registrations,
        participant: participants,
      })
      .from(registrations)
      .leftJoin(participants, eq(registrations.participantId, participants.id))
      .where(eq(registrations.itemId, itemId))
      .all();

    return c.json(itemRegistrations);
  })
  .get("/participant/:participantId", async (c) => {
    const participantId = parseInt(c.req.param("participantId"));
    const db = c.get("db");

    const participantRegistrations = await db
      .select({
        registration: registrations,
        item: items,
      })
      .from(registrations)
      .leftJoin(items, eq(registrations.itemId, items.id))
      .where(eq(registrations.participantId, participantId))
      .all();

    return c.json(participantRegistrations);
  });

export default router;
