import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { config } from './config.js'

// Singleton Prisma client — one connection pool for the entire process.
// Import `db` everywhere DB access is needed.
// pg closes a connection after 10 s idle, and a new one to the Supabase pooler costs ~0.7 s in production (Sentry
// pg.connect p50), so most requests on a quiet day paid it. `min` keeps two open. The pooler sits behind an AWS load
// balancer that drops a connection after 350 s of silence; a probe every 60 s keeps it (the OS default waits 2 hours).
export const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.databaseUrl, min: 2, keepAlive: true, keepAliveInitialDelayMillis: 60_000 }),
})
