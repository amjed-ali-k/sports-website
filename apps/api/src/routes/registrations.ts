import { z } from "zod";
import { registrations, items, participants, sections } from "@sports/database";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createRegistrationSchema = z.object({
  itemId: z.number(),
  participantId: z.number(),
  groupId: z.number().optional().nullable(),
  metaInfo: z.string().optional().nullable(),
});

const updateRegistrationSchema = z.object({
  itemId: z.number(),
  participantId: z.number(),
  groupId: z.number().optional().nullable(),
  metaInfo: z.string().optional().nullable(),
  status: z.enum(["registered", "participated", "not_participated"]).optional().default("registered"),
});

const router = hono()
  .post("/", zodValidator(createRegistrationSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Verify if item and participant exist
    const [item, participant] = await Promise.all([
      db.select().from(items).where(eq(items.id, data.itemId)).get(),
      db
        .select()
        .from(participants)
        .where(eq(participants.id, data.participantId))
        .get(),
    ]);

    if (!item || !participant) {
      return c.json({ error: "Item or participant not found" }, 404);
    }

    // Check if registration already exists
    const existingRegistration = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.participantId, data.participantId),
          eq(registrations.itemId, data.itemId)
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
      .values({
        ...data,
        status: "registered",
      })
      .returning()
      .get();

    return c.json(registration, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");

    const allRegistrations = await db
      .select({
        registration: registrations,
        participant: {
          id: participants.id,
          fullName: participants.fullName,
          chestNo: participants.chestNo,
          sectionId: sections.id,
          sectionName: sections.name,
        },
        item: {
          id: items.id,
          name: items.name,
        },
      })
      .from(registrations)
      .innerJoin(sections, eq(sections.id, participants.sectionId))
      .innerJoin(participants, eq(registrations.participantId, participants.id))
      .innerJoin(items, eq(registrations.itemId, items.id))
      .all();

    return c.json(allRegistrations);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const registration = await db
      .select({
        registration: registrations,
        participant: {
          id: participants.id,
          fullName: participants.fullName,
          chestNo: participants.chestNo,
        },
        item: {
          id: items.id,
          name: items.name,
        },
      })
      .from(registrations)
      .where(eq(registrations.id, id))
      .innerJoin(participants, eq(registrations.participantId, participants.id))
      .innerJoin(items, eq(registrations.itemId, items.id))
      .get();

    if (!registration) {
      return c.json({ error: "Registration not found" }, 404);
    }

    return c.json(registration);
  })
  .put("/:id", zodValidator(updateRegistrationSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if registration exists
    const existingRegistration = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .get();

    if (!existingRegistration) {
      return c.json({ error: "Registration not found" }, 404);
    }

    // Verify if item and participant exist
    const [item, participant] = await Promise.all([
      db.select().from(items).where(eq(items.id, data.itemId)).get(),
      db
        .select()
        .from(participants)
        .where(eq(participants.id, data.participantId))
        .get(),
    ]);

    if (!item || !participant) {
      return c.json({ error: "Item or participant not found" }, 404);
    }

    // Check if another registration exists for the same participant and item
    const duplicateRegistration = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.participantId, data.participantId),
          eq(registrations.itemId, data.itemId),
          eq(registrations.id, id)
        )
      )
      .get();

    if (duplicateRegistration && duplicateRegistration.id !== id) {
      return c.json(
        { error: "Participant already registered for this item" },
        400
      );
    }

    const updatedRegistration = await db
      .update(registrations)
      .set(data)
      .where(eq(registrations.id, id))
      .returning()
      .get();

    return c.json(updatedRegistration);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if registration exists
    const existingRegistration = await db
      .select()
      .from(registrations)
      .where(eq(registrations.id, id))
      .get();

    if (!existingRegistration) {
      return c.json({ error: "Registration not found" }, 404);
    }

    await db.delete(registrations).where(eq(registrations.id, id));
    return c.json({ success: true });
  })
  .patch(
    "/:id/status",
    zodValidator(z.object({
      status: z
        .enum(["registered", "participated", "not_participated"])
       
    })),
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
        participant: {
          id: participants.id,
          fullName: participants.fullName,
          chestNo: participants.chestNo,
        },
      })
      .from(registrations)
      .innerJoin(participants, eq(registrations.participantId, participants.id))
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
        item: {
          id: items.id,
          name: items.name,
        },
      })
      .from(registrations)
      .innerJoin(items, eq(registrations.itemId, items.id))
      .where(eq(registrations.participantId, participantId))
      .all();

    return c.json(participantRegistrations);
  });

export default router;
