import { sections } from "@sports/database";
import { hono } from "../lib/api";

export const sectionPublicRouter = hono().get("/", async (c) => {
  const db = c.get("db");
  const allSections = await db.select().from(sections).all();
  return c.json(allSections);
});