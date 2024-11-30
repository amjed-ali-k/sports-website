import { z } from "zod";
import { settings } from "@sports/database";
import { eq } from "drizzle-orm";
import { hono, zodValidator } from "../lib/api";

const settingsSchema = z.record(z.string(), z.string());

const router = hono()
  .get("/", async (c) => {
    const db = c.get("db");
    const allSettings = await db.select().from(settings).all();
    
    // Convert to key-value object
    const settingsObject = allSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
    
    return c.json(settingsObject);
  })
  .put("/", zodValidator(settingsSchema), async (c) => {
    const data = c.req.valid("json") as Record<string, string>;
    const db = c.get("db");

    // Delete all existing settings
    await db.delete(settings);
    
    // Insert new settings
    const settingsArray = Object.entries(data).map(([key, value]) => ({
      key,
      value,
    }));
    
    await db.insert(settings).values(settingsArray);
    
    return c.json(data);
  });

export default router;
