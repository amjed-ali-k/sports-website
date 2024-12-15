import {
  hc,
} from "hono/client";
import type { AppType } from "@sports/api";

export const apiClient = hc<AppType>(import.meta.env.VITE_API_URL, {
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY!,
  },
});
