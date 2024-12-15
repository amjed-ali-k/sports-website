import { z } from "zod";
import { participants, sections } from "@sports/database";
import { and, desc, eq, sql } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

export const participantPublicRouter = hono()
  .get(
    "/",
    zodValidator(
      z.object({ page: z.number().optional(), limit: z.number().optional() }),
      "query"
    ),
    async (c) => {
      const db = c.get("db");
      // Get pagination parameters from query parameters
      const page = Number(c.req.query("page")) || 1; // Default to page 1
      const limit = Number(c.req.query("limit")) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit; // Calculate offset

      const allParticipants = await db
        .select({
          name: participants.fullName,
          chestNo: participants.chestNo,
          batch: participants.batch,
          gender: participants.gender,
          avatar: participants.avatar,
          section: {
            id: sections.id,
            name: sections.name,
          },
        })
        .from(participants)
        .innerJoin(sections, eq(participants.sectionId, sections.id))
        .limit(limit) // Set limit for pagination
        .offset(offset) // Set offset for pagination
        .all();

      // Optionally, you can also return the total count of participants for further pagination logic
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .innerJoin(sections, eq(participants.sectionId, sections.id))
        .get();

      return c.json({
        participants: allParticipants,
        total: totalCount?.count || 0,
        page,
        limit,
      });
    }
  )
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const participant = await db
      .select({
        name: participants.fullName,
        chestNo: participants.chestNo,
        batch: participants.batch,
        gender: participants.gender,
        avatar: participants.avatar,
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
  });
