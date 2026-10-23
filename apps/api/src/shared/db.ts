import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'
import { config } from './config.js'

// Singleton Prisma client — one connection pool for the entire process.
// Import `db` everywhere DB access is needed.
export const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: config.databaseUrl }) })
