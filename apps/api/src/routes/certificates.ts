import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";
import {
  certificates,
  events,
  groupItems,
  items,
  participants,
  sections,
} from "@sports/database";
import { format } from "date-fns/format";
import { v7 as uuid } from "uuid";
import jwt from "jsonwebtoken";

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
  itemType: z.enum(["item", "group-item"]),
});

type inputType = z.infer<typeof newCertGenSchema>;

type Certificate = typeof certificates.$inferInsert;

export const certificateRouter = hono()
  .get("/single/:type/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const type = c.req.param("type");
    if (!type || !id) return c.json({ error: "Certificates not found" }, 404);
    const db = c.get("db");
    const cert = await db
      .select()
      .from(certificates)
      .where(and(eq(certificates.ref, id), eq(certificates.type, type as any)))
      .get();
    if (!cert) return c.json({ error: "Certificates not found" }, 404);
    return c.json(cert as Certificate);
  })
  .get("/all/:itemId/:type", async (c) => {
    const { type, itemId } = c.req.param();

    if (!type) return c.json({ error: "Certificates not found" }, 404);
    if (!itemId) return c.json({ error: "certificate not found" }, 404);

    const db = c.get("db");

    const certs = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.itemId, Number(itemId)),
          eq(certificates.itemtype, "item"),
          eq(
            certificates.type,
            type as "participation" | "first" | "second" | "third"
          )
        )
      )
      .all();
    return c.json(certs as Certificate[]);
  })
  .post("/new", zodValidator(newCertGenSchema), async (c) => {
    const details = c.req.valid("json");
    const db = c.get("db");

    const res =
      details.itemType === "item"
        ? await db
            .select()
            .from(items)
            .where(eq(items.id, details.itemId))
            .leftJoin(events, eq(events.id, items.eventId))
            .get()
        : await db
            .select({ items: groupItems, events })
            .from(groupItems)
            .where(eq(groupItems.id, details.itemId))
            .leftJoin(events, eq(events.id, groupItems.eventId))
            .get();

    if (!res)
      return c.json({ error: "An Error occured!. Item not found" }, 404);
    const item = res.items;
    if (!item)
      return c.json({ error: "An Error occured!. Item not found" }, 404);
    const event = res.events;
    if (!event)
      return c.json({ error: "An Error occured!. Event not found" }, 404);
    const certMap = event.certificateTemplates;
    const certificate = certMap?.[details.type];
    if (!certificate)
      return c.json(
        { error: "An Error occured!. Certificate template not found" },
        404
      );

    const participant = await db
      .select()
      .from(participants)
      .where(eq(participants.id, details.participantId))
      .leftJoin(sections, eq(sections.id, participants.sectionId))
      .get();
    if (!participant)
      return c.json({ error: "An Error occured!. Participant not found" }, 404);
    const id = uuid();

    const certificateElements = certificate.certificateElements.map((elm) => {
      if (!elm.variable) return elm;
      let text = "";
      if (elm.variable === "date") text = format(new Date(), "dd-MM-yyy");
      if (elm.variable === "eventName") text = event.name;
      if (elm.variable === "itemName") text = item.name;
      if (elm.variable === "name") text = participant.participants.fullName;
      if (elm.variable === "position") text = details.type;
      if (elm.variable === "id") text = id;
      if (elm.variable === "sectionName")
        text = participant.sections?.name || "";
      return { ...elm, text };
    });

    const body = {
      ...certificate,
      certificateElements,
      id,
      reciptent: participant.participants.fullName,
      reciptentDescription: participant.sections?.name,
      issuedFor: details.type,
      issuedForDescription:
        details.type === "participation"
          ? `Participation in ${item.name} at ${event.name}.`
          : `Achieving ${details.type} prize in ${item.name} at ${event.name}.`,
    };
    const data = jwt.sign(body, c.env.CERT_KEY ?? "my-super-secret-key");
    console.log(JSON.stringify({ url: `${c.env.CERT_API}/generate-cert` }));
    try {
      const certRes = (await fetch(`${c.env.CERT_API}/generate-cert`, {
        method: "PUT",
        body: JSON.stringify({ data }),
        headers: {
          "Content-Type": "application/json",
        },
      }).then((e) => e.json())) as {
        message: string;
        id: string;
      };

      if (certRes.id === id) {
        console.log("Certificate Generated!");
      }
    } catch (error) {
      return c.json({ error: "An Error occured!. Generation failed" }, 404);
    }
    const cert = await db
      .insert(certificates)
      .values({
        key: id,
        data: body,
        itemId: item.id,
        type: details.type,
        ref: details.id,
        itemtype: details.itemType,
      })
      .returning()
      .get();

    return c.json(cert);
  })
  .get("/allgroup/:itemId/:type", async (c) => {
    const { type, itemId } = c.req.param();

    if (!type) return c.json({ error: "Certificates not found" }, 404);
    if (!itemId) return c.json({ error: "certificate not found" }, 404);

    const db = c.get("db");

    const certs = await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.itemId, Number(itemId)),
          eq(certificates.itemtype, "group-item"),
          eq(
            certificates.type,
            type as "participation" | "first" | "second" | "third"
          )
        )
      )
      .all();
    return c.json(certs as Certificate[]);
  });
