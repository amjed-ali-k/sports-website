import { z } from "zod";
import { participants, sections } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createParticipantSchema = z.object({
  fullName: z.string().min(1),
  sectionId: z.number(),
  semester: z.number().min(1).max(8),
  gender: z.enum(["male", "female"]),
  avatar: z.string().optional().nullable(),

});

const updateParticipantSchema = z.object({
  fullName: z.string().min(1),
  sectionId: z.number(),
  semester: z.number().min(1).max(8),
  gender: z.enum(["male", "female"]),
  avatar: z.string().optional().nullable(),
});

const router = hono()
  .post("/", zodValidator(createParticipantSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if section exists
    const section = await db
      .select()
      .from(sections)
      .where(eq(sections.id, data.sectionId))
      .get();

    if (!section) {
      return c.json({ error: "Section not found" }, 404);
    }

    // Generate chest number (you might want to implement your own logic)
    const latestParticipant = await db
      .select()
      .from(participants)
      .orderBy(participants.chestNo)
      .get();

    const chestNo = latestParticipant ? latestParticipant.chestNo + 1 : 1000;

    const participant = await db
      .insert(participants)
      .values({
        ...data,
        chestNo: chestNo.toString(),
      })
      .returning()
      .get();

    return c.json(participant, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");

    const allParticipants = await db
      .select({
        participant: participants,
        section: {
          id: sections.id,
          name: sections.name,
        },
      })
      .from(participants)
      .innerJoin(sections, eq(participants.sectionId, sections.id))
      .all();

    return c.json(allParticipants);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const participant = await db
      .select({
        participant: participants,
        section: {
          id: sections.id,
          name: sections.name,
        },
      })
      .from(participants)
      .where(eq(participants.id, id))
      .innerJoin(sections, eq(participants.sectionId, sections.id))
      .get();

    if (!participant) {
      return c.json({ error: "Participant not found" }, 404);
    }

    return c.json(participant);
  })
  .put("/:id", zodValidator(updateParticipantSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if participant exists
    const existingParticipant = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id))
      .get();

    if (!existingParticipant) {
      return c.json({ error: "Participant not found" }, 404);
    }

    // Check if section exists
    const section = await db
      .select()
      .from(sections)
      .where(eq(sections.id, data.sectionId))
      .get();

    if (!section) {
      return c.json({ error: "Section not found" }, 404);
    }

    const updatedParticipant = await db
      .update(participants)
      .set(data)
      .where(eq(participants.id, id))
      .returning()
      .get();

    return c.json(updatedParticipant);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if participant exists
    const existingParticipant = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id))
      .get();

    if (!existingParticipant) {
      return c.json({ error: "Participant not found" }, 404);
    }

    // TODO: You might want to check if participant has any registrations
    // and handle that case appropriately (either prevent deletion or cascade delete)

    await db.delete(participants).where(eq(participants.id, id));
    return c.json({ success: true });
  });

export default router;
