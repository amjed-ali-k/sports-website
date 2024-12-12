import { z } from "zod";
import {
  events,
  groupItems,
  groupRegistrations,
  groupResults,
  participants,
} from "@sports/database";
import { and, eq, sql } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const createGroupItemSchema = z.object({
  name: z.string(),
  pointsFirst: z.number(),
  pointsSecond: z.number(),
  pointsThird: z.number(),
  minParticipants: z.number(),
  maxParticipants: z.number(),
  eventId: z.number(),
  iconName: z.string().nullish(),
  gender: z.enum(["male", "female", "any"]),
});

const updateGroupItemSchema = z.object({
  name: z.string().optional(),
  pointsFirst: z.number().optional(),
  pointsSecond: z.number().optional(),
  pointsThird: z.number().optional(),
  minParticipants: z.number().optional(),
  maxParticipants: z.number().optional(),
  eventId: z.number().optional(),
  gender: z.enum(["male", "female", "any"]).optional(),
});

const createGroupRegistrationSchema = z.object({
  groupItemId: z.number(),
  participantIds: z.array(z.number()),
  name: z.string().nullish()
});

const updateGroupRegistrationSchema = z.object({
  groupItemId: z.number().optional(),
  participantIds: z.array(z.number()).optional(),
  metaInfo: z.string().optional(),
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
  .put("/items/:id", zodValidator(updateGroupItemSchema), async (c) => {
    const db = c.get("db");
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");

    const item = await db
      .update(groupItems)
      .set(data)
      .where(eq(groupItems.id, id))
      .returning()
      .get();

    if (!item) {
      return c.json({ error: "Group item not found" }, 404);
    }

    return c.json(item);
  })
  .delete("/items/:id", async (c) => {
    const db = c.get("db");
    const id = Number(c.req.param("id"));

    const item = await db
      .delete(groupItems)
      .where(eq(groupItems.id, id))
      .returning()
      .get();

    if (!item) {
      return c.json({ error: "Group item not found" }, 404);
    }

    return c.json(item);
  })

  // Group Registrations
  .post(
    "/registrations",
    zodValidator(createGroupRegistrationSchema),
    async (c) => {
      const data = c.req.valid("json");
      const db = c.get("db");

      // Check if group item exists and get participant limits
      const res = await db
        .select()
        .from(groupItems)
        .where(
          and(
            eq(events.organizationId, c.get("user").organizationId),
            eq(groupItems.id, data.groupItemId)
          )
        )
        .leftJoin(events, eq(groupItems.eventId, events.id))
        .get();

      if (!res || !res.group_items) {
        return c.json({ error: "Group item not found" }, 404);
      }

      const groupItem = res.group_items;

      // Validate participant count
      if (
        data.participantIds.length < groupItem.minParticipants ||
        data.participantIds.length > groupItem.maxParticipants
      ) {
        return c.json(
          {
            error: `Number of participants must be between ${groupItem.minParticipants} and ${groupItem.maxParticipants}`,
          },
          400
        );
      }

      // Create group registration with participant IDs
      const registration = await db
        .insert(groupRegistrations)
        .values({
          groupItemId: data.groupItemId,
          participantIds: JSON.stringify(data.participantIds),
          name: data.name
        })
        .returning()
        .get();

      // Return registration with participants
      const fullRegistration = await db
        .select({
          registration: groupRegistrations,
          item: groupItems,
          participants: sql<
            { id: number; name: string }[]
          >`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
        })
        .from(groupRegistrations)
        .innerJoin(
          groupItems,
          eq(groupItems.id, groupRegistrations.groupItemId)
        )
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
    }
  )
  .get("/registrations", async (c) => {
    const db = c.get("db");

    const registrations = await db
      .select({
        registration: groupRegistrations,
        item: groupItems,
        participants: sql<string>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName},
          'chestNo', ${participants.chestNo},
          'sectionId', ${participants.sectionId}
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
  .get("/registrations/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const registration = await db
      .select({
        registration: groupRegistrations,
        item: groupItems,
        participants: sql<string>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName},
          'chestNo', ${participants.chestNo},
          'sectionId', ${participants.sectionId},
          'batch', ${participants.batch}
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
      .where(eq(groupRegistrations.groupItemId, id))
      .groupBy(groupRegistrations.id)
      .all();

    if (!registration) {
      return c.json({ error: "Group registration not found" }, 404);
    }

    return c.json(registration);
  })
  .put(
    "/registrations/:id",
    zodValidator(updateGroupRegistrationSchema),
    async (c) => {
      const id = Number(c.req.param("id"));
      const data = c.req.valid("json");
      const db = c.get("db");
      const organizationId = c.get("user").organizationId;

      // If updating group item or participants, validate the new values
      if (data.groupItemId || data.participantIds) {
        // Get the group item to check participant limits
        const groupItem = await db
          .select()
          .from(groupItems)
          .where(
            and(
              eq(events.organizationId, organizationId),
              eq(groupItems.id, data.groupItemId || 0)
            )
          )
          .leftJoin(events, eq(groupItems.eventId, events.id))
          .get();

        if (data.groupItemId && (!groupItem || !groupItem.group_items)) {
          return c.json({ error: "Group item not found" }, 404);
        }

        // If updating participants, validate the count
        if (data.participantIds && groupItem && groupItem.group_items) {
          if (
            data.participantIds.length <
              groupItem.group_items.minParticipants ||
            data.participantIds.length > groupItem.group_items.maxParticipants
          ) {
            return c.json(
              {
                error: `Number of participants must be between ${groupItem.group_items.minParticipants} and ${groupItem.group_items.maxParticipants}`,
              },
              400
            );
          }
        }
      }

      // Update the registration
      const updateData: any = { ...data };
      if (data.participantIds) {
        updateData.participantIds = JSON.stringify(data.participantIds);
      }

      const registration = await db
        .update(groupRegistrations)
        .set(updateData)
        .where(eq(groupRegistrations.id, id))
        .returning()
        .get();

      if (!registration) {
        return c.json({ error: "Group registration not found" }, 404);
      }

      // Return the updated registration with full details
      const updatedRegistration = await db
        .select({
          registration: groupRegistrations,
          item: groupItems,
          participants: sql<string>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName}
        ))`.as("participants"),
        })
        .from(groupRegistrations)
        .innerJoin(
          groupItems,
          eq(groupItems.id, groupRegistrations.groupItemId)
        )
        .innerJoin(
          participants,
          sql`${participants.id} IN (
          SELECT value 
          FROM json_each(${groupRegistrations.participantIds})
        )`
        )
        .where(eq(groupRegistrations.id, id))
        .groupBy(groupRegistrations.id)
        .get();

      return c.json(updatedRegistration);
    }
  )
  .delete("/registrations/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    const registration = await db
      .delete(groupRegistrations)
      .where(eq(groupRegistrations.id, id))
      .returning()
      .get();

    if (!registration) {
      return c.json({ error: "Group registration not found" }, 404);
    }

    return c.json(registration);
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
      .innerJoin(
        events,
        eq(events.organizationId, c.get("user").organizationId)
      )
      .where(
        and(
          eq(groupRegistrations.id, data.groupRegistrationId),
          eq(groupItems.eventId, events.id)
        )
      )
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
        groupItemId: registration.item.id
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
        participants: sql<string>`json_group_array(json_object(
          'id', ${participants.id},
          'name', ${participants.fullName},
          'chestNo', ${participants.chestNo},
          'sectionId', ${participants.sectionId}
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
      .where(eq(participants.sectionId, Number(sectionId)))
      .groupBy(groupResults.id)
      .all();

    return c.json(results);
  });
