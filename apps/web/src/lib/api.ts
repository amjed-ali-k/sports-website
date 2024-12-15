import {
  ClientRequest,
  ClientResponse,
  hc,
  InferRequestType,
  InferResponseType,
} from "hono/client";
import type { AppType } from "@sports/api";
import { type TypedResponse } from "hono/types";

export const apiClient = hc<AppType>(import.meta.env.VITE_API_URL, {
  headers: {
    "X-API-Key": import.meta.env.VITE_API_KEY!,
  },
});
