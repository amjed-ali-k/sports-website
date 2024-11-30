import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { participants } from "@sports/database";
import { eq } from "drizzle-orm";

const router = new Hono<{
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    db: DrizzleD1Database;
  };
}>();

const createParticipantSchema = z.object({
  fullName: z.string().min(1),
  sectionId: z.number(),
  semester: z.number().min(1).max(8),
  gender: z.enum(["male", "female"]),
  avatar: z.string().optional(),
});

router.post("/", zValidator("json", createParticipantSchema), async (c) => {
  const data = c.req.valid("json");
  const db = c.get("db");

  // Generate chest number (implement your logic)
  const chestNo = `CH${Date.now()}`;

  const participant = await db
    .insert(participants)
    .values({
      ...data,
      chestNo,
    })
    .returning()
    .get();

  return c.json(participant, 201);
});

router.get("/", async (c) => {
  const db = c.get("db");
  const allParticipants = await db.select().from(participants).all();
  return c.json(allParticipants);
});

router.get("/:id", async (c) => {
  const id = parseInt(c.req.param("id"));
  const db = c.get("db");

  const participant = await db
    .select()
    .from(participants)
    .where(eq(participants.id, id))
    .get();

  if (!participant) {
    return c.json({ error: "Participant not found" }, 404);
  }

  return c.json(participant);
});

export default router;
