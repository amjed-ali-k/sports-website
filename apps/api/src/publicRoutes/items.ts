import {
  items,
  events,
  registrations,
  participants,
  results,
  groupResults,
  groupRegistrations,
  groupItems,
} from "@sports/database";
import { count, eq, sql } from "drizzle-orm";
import { hono } from "../lib/api";

export const publicItemsRouter = hono()
  .get("/all/individual/:eventId", async (c) => {
    const db = c.get("db");
    const eventId = Number(c.req.param("eventId"));
    const allItems = await db
      .select({
        item: items,
        registrationCount: sql<number>`count(${registrations.id})`.as(
          "registration_count"
        ),
      })
      .from(items)
      .leftJoin(registrations, eq(items.id, registrations.itemId)) // Join with registrations
      .where(eq(items.eventId, eventId))
      .groupBy(items.id) // Group by item ID to get counts for each item
      .all();
    return c.json(allItems);
  })
  .get("/all/group/:eventId", async (c) => {
    const db = c.get("db");
    const eventId = Number(c.req.param("eventId"));
    const allGroupItems = await db
      .select({
        item: groupItems,
        registrationCount: sql<number>`count(${groupRegistrations.id})`.as(
          "registration_count"
        ),
      })
      .from(groupItems)
      .leftJoin(
        groupRegistrations,
        eq(groupRegistrations.groupItemId, groupItems.id)
      )
      .where(eq(groupItems.eventId, eventId))
      .groupBy(groupItems.id) // Group by group item ID to get counts for each group item
      .all();

    return c.json(allGroupItems);
  })
  .get("/participants/individual/:itemId", async (c) => {
    const db = c.get("db");
    const itemId = Number(c.req.param("itemId"));
    console.log({itemId})
    const allParticipants = await db
      .select()
      .from(registrations)
      .innerJoin(participants, eq(participants.id, registrations.participantId))
      .leftJoin(results, eq(results.registrationId, registrations.id))
      .where(eq(registrations.itemId, itemId));
      console.log(allParticipants);
    return c.json(allParticipants);
  })
  .get("/participants/group/:itemId", async (c) => {
    const db = c.get("db");
    const itemId = Number(c.req.param("itemId"));
    const allParticipants = await db
      .select()
      .from(groupRegistrations)
      .leftJoin(
        groupResults,
        eq(groupResults.groupRegistrationId, groupRegistrations.id)
      )
      .where(eq(groupRegistrations.groupItemId, itemId));
    return c.json(allParticipants);
  });
