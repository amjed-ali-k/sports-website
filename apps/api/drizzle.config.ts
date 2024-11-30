import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  driver: 'd1-http',
  out: 'drizzle',
  schema: '../../packages/database/schema.ts',
// dbCredentials needs only for connect drizzle studio
  dbCredentials: {
    accountId: process.env.CF_ACCOUNT_ID!,
    databaseId: 'fcf3bd8a-90f7-4f54-88a3-8e9ecb70f8dd',
    token: process.env.CF_TOKEN!,
  },
});