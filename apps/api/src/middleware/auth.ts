import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/setup"];

export async function authMiddleware(c: Context, next: Next) {
  // Skip auth for public paths
  if (PUBLIC_PATHS.includes(c.req.path)) {
    return next();
  }

  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new HTTPException(401, { message: "Invalid token" });
  }

  try {
    const payload = await verify(token, c.env.JWT_SECRET);

    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new HTTPException(401, { message: "Token expired" });
    }

    // Add user info to context for downstream handlers
    c.set("user", {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    });

    await next();
  } catch (e) {
    throw new HTTPException(401, { message: "Invalid token" });
  }
}
