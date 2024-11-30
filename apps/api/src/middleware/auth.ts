import { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  // TODO: Implement proper JWT verification
  if (!token) {
    throw new HTTPException(401, { message: 'Invalid token' });
  }

  await next();
}