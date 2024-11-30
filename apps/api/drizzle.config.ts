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
     url: './drizzle/local/v3/d1/miniflare-D1DatabaseObject/6e43194546f211ee1e4c13e0ada4aca104342f596859f2d2a19c1da261566494.sqlite' 
    },
  });