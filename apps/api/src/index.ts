import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import participantsRouter from "./routes/participants";
import itemsRouter from "./routes/items";
import registrationsRouter from "./routes/registrations";
import resultsRouter from "./routes/results";
import categoriesRouter from "./routes/categories";
import settingsRouter from "./routes/settings";
import authRouter from "./routes/auth";
import sectionsRouter from "./routes/sections";
import adminsRouter from "./routes/admins";
import { hono } from "./lib/api";
import { createDb } from "./db/index";
import { logger } from "hono/logger";
import profileRouter from "./routes/profile";
import { groupsRouter } from "./routes/groups";

export * from "./types";

const api = hono()
  .use("*", authMiddleware)
  .route("/profile", profileRouter)
  .route("/participants", participantsRouter)
  .route("/items", itemsRouter)
  .route("/registrations", registrationsRouter)
  .route("/results", resultsRouter)
  .route("/categories", categoriesRouter)
  .route("/sections", sectionsRouter)
  .route("/admins", adminsRouter)
  .route("/settings", settingsRouter)
  .route("/groups", groupsRouter);

const app = hono()
  .use("*", cors())
  .use(logger())
  .use("*", async (c, next) => {
    c.set("db", createDb(c.env.DB));
    await next();
  })
  // Public routes
  .get("/", (c) => c.text("Sports Management API"))
  .route("/auth", authRouter)
  // Protected routes
  .route("/api", api);

export type AppType = typeof app;
export default app;
