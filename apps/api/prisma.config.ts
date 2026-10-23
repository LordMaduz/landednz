// Prisma CLI config (Prisma 7): schema, migrations and the connection URL.
// Locally the URL comes from .env.local; in CI and containers it is already in the environment.
import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

config({ path: '.env.local', quiet: true })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
