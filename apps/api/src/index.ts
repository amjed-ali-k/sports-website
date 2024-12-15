import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import participantsRouter from "./routes/participants";
import itemsRouter from "./routes/items";
import registrationsRouter from "./routes/registrations";
import resultsRouter from "./routes/results";
import eventsRouter from "./routes/events";
import settingsRouter from "./routes/settings";
import authRouter from "./routes/auth";
import sectionsRouter from "./routes/sections";
import adminsRouter from "./routes/admins";
import { hono } from "./lib/api";
import { createDb } from "./db/index";
import { logger } from "hono/logger";
import profileRouter from "./routes/profile";
import { groupsRouter } from "./routes/groups";
import { statsRouter } from "./routes/stats";
import { timing } from "hono/timing";
import { filerouter } from "./routes/files";
import { eventPublicrouter } from "./publicRoutes/events";
import { sectionPublicRouter } from "./publicRoutes/sections";
import { publicItemsRouter } from "./publicRoutes/items";
import { participantPublicRouter } from "./publicRoutes/participants";

export * from "./types";

const api = hono()
  .use("*", authMiddleware)
  .route("/profile", profileRouter)
  .route("/participants", participantsRouter)
  .route("/items", itemsRouter)
  .route("/registrations", registrationsRouter)
  .route("/results", resultsRouter)
  .route("/events", eventsRouter)
  .route("/sections", sectionsRouter)
  .route("/admins", adminsRouter)
  .route("/settings", settingsRouter)
  .route("/groups", groupsRouter)
  .route("/stats", statsRouter)
  .route("/file", filerouter);

const publicRouter = hono()
  .route("/envts", eventPublicrouter)
  .route("/sections", sectionPublicRouter)
  .route("/items", publicItemsRouter)
  .route("/participants", participantPublicRouter);

const app = hono()
  .use("*", cors())
  .use(logger())
  .use(timing())
  .use("*", async (c, next) => {
    c.set("db", createDb(c.env.DB));
    await next();
  })
  // Public routes
  .get("/", (c) => c.text("Sports Management API"))
  .route("/public", publicRouter)
  .route("/auth", authRouter)
  // Protected routes
  .route("/api", api);

export type AppType = typeof app;
export default app;
