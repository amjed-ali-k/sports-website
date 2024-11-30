import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createDb } from './db';
import { authMiddleware } from './middleware/auth';
import participantsRouter from './routes/participants';
import itemsRouter from './routes/items';
import registrationsRouter from './routes/registrations';
import resultsRouter from './routes/results';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// Middleware
app.use('*', cors());
app.use('/api/*', async (c, next) => {
  c.set('db', createDb(c.env.DB));
  await next();
});

// Public routes
app.get('/', (c) => c.text('Sports Management API'));

// Protected routes
const api = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

api.use('*', authMiddleware);
api.route('/participants', participantsRouter);
api.route('/items', itemsRouter);
api.route('/registrations', registrationsRouter);
api.route('/results', resultsRouter);

app.route('/api', api);

export default app;
export type AppType = typeof app;