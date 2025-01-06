import { z } from "zod";
import {
  items,
  participants,
  registrations,
  results,
  sections,
} from "@sports/database";
import { desc, eq, sql } from "drizzle-orm";
import { hono, zodQueryValidator } from "../lib/api";

export const participantPublicRouter = hono()
  .get(
    "/all/:eventId",
    zodQueryValidator(
      z.object({ page: z.string().optional(), limit: z.string().optional() })
    ),
    async (c) => {
      const eventId = Number(c.req.param("eventId"));

      const db = c.get("db");
      // Get pagination parameters from query parameters
      const page = Number(c.req.query("page")) || 1; // Default to page 1
      const limit = Number(c.req.query("limit")) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit; // Calculate offset

      const allParticipants = await db
        .select({
          id: participants.id,
          name: participants.fullName,
          chestNo: participants.chestNo,
          batch: participants.batch,
          gender: participants.gender,
          avatar: participants.avatar,
          sectionId: participants.sectionId,
        })
        .from(participants)
        .innerJoin(sections, eq(participants.sectionId, sections.id))
        .innerJoin(registrations, eq(participants.id, registrations.participantId))
        .leftJoin(items, eq(registrations.itemId, items.id))
        .limit(limit) // Set limit for pagination
        .offset(offset) // Set offset for pagination
        .all();

      // Optionally, you can also return the total count of participants for further pagination logic
      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(participants)
        .innerJoin(sections, eq(participants.sectionId, sections.id))
        .innerJoin(registrations, eq(participants.id, registrations.participantId))
        .leftJoin(items, eq(registrations.itemId, items.id))
        .get();

      return c.json({
        participants: allParticipants,
        total: totalCount?.count || 0,
        page,
        limit,
      });
    }
  )
  .get("/single/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const participant = await db
      .select({
        name: participants.fullName,
        chestNo: participants.chestNo,
        batch: participants.batch,
        gender: participants.gender,
        avatar: participants.avatar,
        sectionId: participants.sectionId,
      })
      .from(participants)
      .where(eq(participants.id, id))
      .get();

    if (!participant) {
      return c.json({ error: "Participant not found" }, 404);
    }

    return c.json(participant);
  })
  .get("/top/:eventId/:count", async (c) => {
    const eventId = Number(c.req.param("eventId"));
    const count = Number(c.req.param("count"));
    const db = c.get("db");

    const topParticipants = await db
      .select({
        name: participants.fullName,
        chestNo: participants.chestNo,
        batch: participants.batch,
        gender: participants.gender,
        id: participants.id,
        avatar: participants.avatar,
        sectionId: participants.sectionId,
        points: sql<number>`sum(${results.points})`,
      })
      .from(participants)
      .where(eq(items.eventId, eventId))
      .innerJoin(results, eq(participants.id, results.registrationId))
      .leftJoin(registrations, eq(registrations.participantId, participants.id))
      .leftJoin(items, eq(items.id, registrations.itemId))
      .orderBy(desc(sql<number>`sum(${results.points})`))
      .groupBy(participants.id)
      .limit(count)
      .all();
    return c.json(topParticipants);
  })
  .get("/stats/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const stats = await db
      .select()
      .from(registrations)
      .where(eq(registrations.participantId, id))
      .leftJoin(results, eq(registrations.id, results.registrationId))
      .all();

    return c.json(stats);
  });
