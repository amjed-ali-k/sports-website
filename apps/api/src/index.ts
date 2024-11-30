import { cors } from "hono/cors";
import { authMiddleware } from "./middleware/auth";
import participantsRouter from "./routes/participants";
import itemsRouter from "./routes/items";
import registrationsRouter from "./routes/registrations";
import resultsRouter from "./routes/results";
import categoriesRouter from "./routes/categories";
import settingsRouter from "./routes/settings";
import { hono } from "./lib/api";
import { createDb } from "./db/index";
import { logger } from "hono/logger";

export * from "./types";

const api = hono()
  .use("*", authMiddleware)
  .route("/participants", participantsRouter)
  .route("/items", itemsRouter)
  .route("/registrations", registrationsRouter)
  .route("/results", resultsRouter)
  .route("/categories", categoriesRouter)
  .route("/settings", settingsRouter);

const app = hono()
  .use("*", cors())
  .use(logger())
  .use("/api/*", async (c, next) => {
    c.set("db", createDb(c.env.DB));
    await next();
  })
  // Public routes
  .get("/", (c) => c.text("Sports Management API"))
  // Protected routes
  .route("/api", api);

export type AppType = typeof app;
export default app;
