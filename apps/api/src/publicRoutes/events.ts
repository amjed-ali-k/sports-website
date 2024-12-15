import {
  events,
  groupItems,
  groupRegistrations,
  groupResults,
  items,
  participants,
  registrations,
  results,
} from "@sports/database";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { hono } from "../lib/api";

export const eventPublicrouter = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allCategories = await db.select().from(events).all();
    return c.json(allCategories);
  })
  .get("/:eventId/results", async (c) => {
    const eventId = Number(c.req.param("eventId"));
    const db = c.get("db");

    // Get individual item results grouped by section
    const individualResults = await db
      .select({
        sectionId: participants.sectionId,
        totalPoints: sql<number>`sum(${results.points})`.as("total_points"),
        firstCount:
          sql<number>`sum(case when ${results.position} = 'first' then 1 else 0 end)`.as(
            "first_count"
          ),
        secondCount:
          sql<number>`sum(case when ${results.position} = 'second' then 1 else 0 end)`.as(
            "second_count"
          ),
        thirdCount:
          sql<number>`sum(case when ${results.position} = 'third' then 1 else 0 end)`.as(
            "third_count"
          ),
      })
      .from(results)
      .innerJoin(registrations, eq(results.registrationId, registrations.id))
      .innerJoin(items, eq(registrations.itemId, items.id))
      .innerJoin(participants, eq(registrations.participantId, participants.id))
      .where(eq(items.eventId, eventId))
      .groupBy(participants.sectionId);

    // Get group item results grouped by section
    const _groupResults = await db
      .select({
        sectionId: groupRegistrations.sectionId,
        totalPoints: sql<number>`sum(${groupResults.points})`.as(
          "total_points"
        ),
        firstCount:
          sql<number>`sum(case when ${groupResults.position} = 'first' then 1 else 0 end)`.as(
            "first_count"
          ),
        secondCount:
          sql<number>`sum(case when ${groupResults.position} = 'second' then 1 else 0 end)`.as(
            "second_count"
          ),
        thirdCount:
          sql<number>`sum(case when ${groupResults.position} = 'third' then 1 else 0 end)`.as(
            "third_count"
          ),
      })
      .from(groupResults)
      .innerJoin(
        groupRegistrations,
        eq(groupResults.groupRegistrationId, groupRegistrations.id)
      )
      .innerJoin(groupItems, eq(groupResults.groupItemId, groupItems.id))
      .where(
        and(
          eq(groupItems.eventId, eventId),
          isNotNull(groupRegistrations.sectionId)
        )
      )
      .groupBy(groupRegistrations.sectionId);

    // Combine results for each section
    const sections = new Set([
      ...individualResults?.map((r) => r.sectionId),
      ..._groupResults?.map((r) => r.sectionId),
    ]);

    const combinedResults = Array.from(sections).map((sectionId) => {
      const individual = individualResults.find(
        (r) => r.sectionId === sectionId
      ) || {
        totalPoints: 0,
        firstCount: 0,
        secondCount: 0,
        thirdCount: 0,
      };
      const group = _groupResults.find((r) => r.sectionId === sectionId) || {
        totalPoints: 0,
        firstCount: 0,
        secondCount: 0,
        thirdCount: 0,
      };

      return {
        sectionId,
        totalPoints: individual.totalPoints + group.totalPoints,
        individual: {
          points: individual.totalPoints,
          first: individual.firstCount,
          second: individual.secondCount,
          third: individual.thirdCount,
        },
        group: {
          points: group.totalPoints,
          first: group.firstCount,
          second: group.secondCount,
          third: group.thirdCount,
        },
      };
    });

    return c.json({
      results: combinedResults.sort((a, b) => b.totalPoints - a.totalPoints),
    });
  });
