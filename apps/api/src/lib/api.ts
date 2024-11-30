import { createDb } from "../db/index";
import { Hono } from "hono";


export const hono = () => new Hono<{
    Bindings: {
      DB: D1Database;
    };
    Variables: {
      db: ReturnType<typeof createDb>;
    } 
  }>();