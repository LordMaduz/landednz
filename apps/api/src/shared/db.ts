import { PrismaClient } from '@prisma/client'

// Singleton Prisma client — one connection pool for the entire process.
// Import `db` everywhere DB access is needed.
export const db = new PrismaClient()
