import { z } from "zod";
import { events } from "@sports/database";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

 const singleCertTemplate = z
  .object({
    certificateElements: z.array(
      z.object({
        text: z.string().optional(),
        styles: z.object({}).passthrough(),
        variable: z.enum([
          "name",
          "eventName",
          "itemName",
          "position",
          "points",
          "date",
          "sectionName",
          "id"
        ]).optional(),
      })
    ),
    height: z.number(),
    width: z.number(),
    fonts: z.array(z.string()),
    certificateBackground: z.string().optional(),
    issuer: z.string().optional(),
    issuerDescription: z.string().optional(),
  })
  .optional();

const createEventSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().nullish(),
  logo: z.string().nullish(),
  image: z.string().nullish(),
  maxRegistrationPerParticipant: z.number().int().min(1).default(3),
  issuer: z.string().nullish(),
  issuerDescription: z.string().nullish(),
  certificateTemplates: z
    .object({
      participation: singleCertTemplate,
      first: singleCertTemplate,
      second: singleCertTemplate,
      third:singleCertTemplate,
    })
    .nullish(),
});

const router = hono()
  .post("/", zodValidator(createEventSchema), async (c) => {
    const data = c.req.valid("json");
    const db = c.get("db");
    const organizationId = c.get("user").organizationId;
    const event = await db
      .insert(events)
      .values({ ...data, organizationId })
      .returning()
      .get();
    return c.json(event, 201);
  })
  .get("/", async (c) => {
    const db = c.get("db");
    const allCategories = await db.select().from(events).all();
    return c.json(allCategories);
  })
  .get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");
    const event = await db.select().from(events).where(eq(events.id, id)).get();

    if (!event) {
      return c.json({ error: "Event not found" }, 404);
    }

    return c.json(event);
  })
  .put("/:id", zodValidator(createEventSchema), async (c) => {
    const id = Number(c.req.param("id"));
    const data = c.req.valid("json");
    const db = c.get("db");

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizationId, c.get("user").organizationId),
          eq(events.id, id)
        )
      )
      .get();

    if (!existingEvent) {
      return c.json({ error: "Event not found" }, 404);
    }

    const updatedEvent = await db
      .update(events)
      .set(data)
      .where(eq(events.id, id))
      .returning()
      .get();

    return c.json(updatedEvent);
  })
  .delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const db = c.get("db");

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.organizationId, c.get("user").organizationId),
          eq(events.id, id)
        )
      )
      .get();

    if (!existingEvent) {
      return c.json({ error: "Event not found" }, 404);
    }

    // TODO: You might want to check if event has any items
    // and handle that case appropriately (either prevent deletion or cascade delete)

    await db.delete(events).where(eq(events.id, id));
    return c.json({ success: true });
  })

export default router;
