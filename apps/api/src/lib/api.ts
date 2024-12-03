import { createDb } from "../db/index";
import { Hono } from "hono";
import { validator } from "hono/validator";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

type Variables = {
  db: ReturnType<typeof createDb>;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    avatar?: string | null;
    organizationId: number;
  };
};

export const hono = <Path extends string = "/">() =>
  new Hono<{
    Bindings: Bindings;
    Variables: Variables;
    Path: Path;
  }>();

export const zodValidator = <T extends {}>(schema: {
  parse: (value: unknown) => T;
}) =>
  validator("json", (value, c) => {
    const parsed = schema.parse(value);
    if (!parsed) {
      return c.json({ message: "Validation failed" }, 400);
    }
    return parsed;
  });
