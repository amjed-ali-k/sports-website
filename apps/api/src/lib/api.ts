import { createDb } from "../db/index";
import { Hono } from "hono";
import { validator } from "hono/validator";
import type { TimingVariables } from 'hono/timing'

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  IMGBB_API_KEY: string;
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
} & TimingVariables;

export const hono = <Path extends string = "/">() =>
  new Hono<{
    Bindings: Bindings;
    Variables: Variables;
    Path: Path;
  }>();

export const zodValidator = <T extends {}>(schema: {
  parse: (value: unknown) => T;
}, v : 'query' | 'json' = 'json') =>
  validator(v, (value, c) => {
    const parsed = schema.parse(value);
    if (!parsed) {
      return c.json({ message: "Validation failed" }, 400);
    }
    return parsed;
  });
