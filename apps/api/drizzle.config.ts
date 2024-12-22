import { defineConfig } from 'drizzle-kit';
import 'dotenv/config'

// export default defineConfig({
//   dialect: 'sqlite',
//   driver: 'd1-http',
//   out: 'drizzle',
//   schema: '../../packages/database/schema.ts',
// // dbCredentials needs only for connect drizzle studio
//   dbCredentials: {
//     accountId: process.env.CF_ACCOUNT_ID!,
//     databaseId: 'fcf3bd8a-90f7-4f54-88a3-8e9ecb70f8dd',
//     token: process.env.CF_TOKEN!,
//   },
// });

export default defineConfig({
    dialect: 'sqlite',
    // driver: 'd1-http',
    out: 'drizzle',
    schema: '../../packages/database/schema.ts',
  // dbCredentials needs only for connect drizzle studio
    dbCredentials: {
     url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/fd64bedb721f1db6c7f78a770f06f2fe88e3a329e1c810f7d63bf185a3fd20b9.sqlite' 
    },
  });