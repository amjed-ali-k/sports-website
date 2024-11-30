import type { Hono } from 'hono'

export type AppType = typeof import('./src/index').default;
