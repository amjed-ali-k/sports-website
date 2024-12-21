// http://localhost:5173/

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";
import { certificates, events, items, participants } from "@sports/database";

const newCertSchema = z.object({
  id: z.string().uuid().optional(),
  reciptent: z.string(),
  reciptentDescription: z.string(),
  issuer: z.string(),
  issuerDescription: z.string(),
  issuedFor: z.string(),
  issuedForDescription: z.string(),
  certificateElements: z.array(
    z.object({
      text: z.string(),
      styles: z.object({}),
    })
  ),
  height: z.number(),
  width: z.number(),
  fonts: z.array(z.string()),
  certificateBackground: z.string(),
});

const newCertGenSchema = z.object({
  itemId: z.number(),
  id: z.number(),
  type: z.enum(["participation", "first", "second", "third"]),
  participantId: z.number(),
});

export const certificateRouter = hono()
  .get("/single/:type/:id", async (c) => {
    const { type, id } = c.req.param();
    if (!type || !id) return;
    const db = c.get("db");
    const cert = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.ref, Number(id)),
          eq(certificates.type, type as any)
        )
      )
      .get();
    return c.json(cert);
  })
  .get("/all/:itemId/:type/", async (c) => {
    const { type, itemId } = c.req.param();
    if (!type || !itemId) return;
    const db = c.get("db");
    const certs = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.itemId, Number(itemId)),
          eq(certificates.type, type as any)
        )
      )
      .all();
    return c.json(certs);
  })
  .post("/new", zodValidator(newCertGenSchema), async (c) => {
    const details = c.req.valid("json");
    const db = c.get("db");

    const res = await db
      .select()
      .from(items)
      .where(eq(items.id, details.itemId))
      .leftJoin(events, eq(events.id, items.eventId))
      .get();

    const item = res?.items;
    if (!item) return;
    const event = res.events;
    if (!event) return;
    const certMap = event.certificateTemplates;
    const certificate = certMap?.[details.type];
    if (!certificate) return;

    const participant = await db
      .select()
      .from(participants)
      .where(eq(participants.id, details.participantId))
      .get();
    if (!participant) return;

    

  });
