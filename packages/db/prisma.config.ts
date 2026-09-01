import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Only used by Prisma CLI migration tooling (e.g. `prisma migrate diff`).
    // At runtime the Worker uses the D1 binding via the PrismaD1 adapter.
    url: 'file:./prisma/d1-migration.db',
  },
})
