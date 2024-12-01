import { z } from "zod";
import {
  groupItems,
  groupRegistrations,
  groupResults,
  participants,
} from "@sports/database";
import { eq, and, sql, desc } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createGroupItemSchema = z.object({
  name: z.string(),
  sectionId: z.number(),
  pointsFirst: z.number(),
  pointsSecond: z.number(),
  pointsThird: z.number(),
  minParticipants: z.number(),
  maxParticipants: z.number(),
  categoryId: z.number(),
  gender: z.enum(["male", "female", "any"]),
});

const createGroupRegistrationSchema = z.object({
  groupItemId: z.number(),
  participantIds: z.array(z.number()),
});

const createGroupResultSchema = z.object({
  groupRegistrationId: z.number(),
  position: z.enum(["first", "second", "third"]),
});

export const groupsRouter = hono()
  // Group Items CRUD
  .post("/items", zodValidator(createGroupItemSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    const item = await db.insert(groupItems).values(data).returning().get();
    return c.json(item, 201);
  })
  .get("/items", async (c) => {
    const db = c.get("db");
    const items = await db.select().from(groupItems).all();
    return c.json(items);
  })
  .get("/items/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const item = await db
      .select()
      .from(groupItems)
      .where(eq(groupItems.id, id))
      .get();

    if (!item) {
      return c.json({ error: "Group item not found" }, 404);
    }

    return c.json(item);
  })

  // Group Registrations
  .post("/registrations", zodValidator(createGroupRegistrationSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if group item exists and get participant limits
    const groupItem = await db
      .select()
      .from(groupItems)
      .where(eq(groupItems.id, data.groupItemId))
      .get();

    if (!groupItem) {
      return c.json({ error: "Group item not found" }, 404);
    }

    // Validate participant count
    if (
      data.participantIds.length < groupItem.minParticipants ||
      data.participantIds.length > groupItem.maxParticipants
    ) {
      return c.json({
        error: `Number of participants must be between ${groupItem.minParticipants} and ${groupItem.maxParticipants}`,
      }, 400);
    }

    // Create group registration with participant IDs
    const registration = await db
      .insert(groupRegistrations)
      .values({
        groupItemId: data.groupItemId,
        participantIds: JSON.stringify(data.participantIds),
      })
      .returning()
      .get();

    // Return registration with participants
    const fullRegistration = await db
      .select({
        registration: groupRegistrations,
        item: groupItems,
        participants: sql<any>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
      })
      .from(groupRegistrations)
      .innerJoin(groupItems, eq(groupItems.id, groupRegistrations.groupItemId))
      .innerJoin(
        participants,
        sql`${participants.id} IN (
          SELECT value 
          FROM json_each(${groupRegistrations.participantIds})
        )`
      )
      .where(eq(groupRegistrations.id, registration.id))
      .groupBy(groupRegistrations.id)
      .get();

    return c.json(fullRegistration, 201);
  })
  .get("/registrations", async (c) => {
    const db = c.get("db");

    const registrations = await db
      .select({
        registration: groupRegistrations,
        item: groupItems,
        participants: sql<any>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
      })
      .from(groupRegistrations)
      .innerJoin(groupItems, eq(groupItems.id, groupRegistrations.groupItemId))
      .innerJoin(
        participants,
        sql`${participants.id} IN (
          SELECT value 
          FROM json_each(${groupRegistrations.participantIds})
        )`
      )
      .groupBy(groupRegistrations.id)
      .all();

    return c.json(registrations);
  })

  // Group Results
  .post("/results", zodValidator(createGroupResultSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if registration exists
    const registration = await db
      .select({
        registration: groupRegistrations,
        item: groupItems,
      })
      .from(groupRegistrations)
      .innerJoin(groupItems, eq(groupItems.id, groupRegistrations.groupItemId))
      .where(eq(groupRegistrations.id, data.groupRegistrationId))
      .get();

    if (!registration) {
      return c.json({ error: "Group registration not found" }, 404);
    }

    // Calculate points based on position
    const points =
      data.position === "first"
        ? registration.item.pointsFirst
        : data.position === "second"
        ? registration.item.pointsSecond
        : registration.item.pointsThird;

    // Create result
    const result = await db
      .insert(groupResults)
      .values({
        groupRegistrationId: data.groupRegistrationId,
        position: data.position,
        points,
      })
      .returning()
      .get();

    return c.json(result, 201);
  })
  .get("/results", async (c) => {
    const db = c.get("db");

    const results = await db
      .select({
        result: groupResults,
        registration: groupRegistrations,
        item: groupItems,
        participants: sql<any>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
      })
      .from(groupResults)
      .innerJoin(
        groupRegistrations,
        eq(groupRegistrations.id, groupResults.groupRegistrationId)
      )
      .innerJoin(groupItems, eq(groupItems.id, groupRegistrations.groupItemId))
      .innerJoin(
        participants,
        sql`${participants.id} IN (
          SELECT value 
          FROM json_each(${groupRegistrations.participantIds})
        )`
      )
      .groupBy(groupResults.id)
      .all();

    return c.json(results);
  })
  .get("/results/section/:sectionId", async (c) => {
    const sectionId = c.req.param("sectionId");
    const db = c.get("db");

    const results = await db
      .select({
        item: groupItems,
        registration: groupRegistrations,
        result: groupResults,
        participants: sql<any>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
      })
      .from(groupResults)
      .innerJoin(
        groupRegistrations,
        eq(groupRegistrations.id, groupResults.groupRegistrationId)
      )
      .innerJoin(groupItems, eq(groupItems.id, groupRegistrations.groupItemId))
      .innerJoin(
        participants,
        sql`${participants.id} IN (
          SELECT value 
          FROM json_each(${groupRegistrations.participantIds})
        )`
      )
      .where(eq(groupItems.sectionId, Number(sectionId)))
      .groupBy(groupResults.id)
      .all();

    return c.json(results);
  });
