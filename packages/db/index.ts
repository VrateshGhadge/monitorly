import { PrismaNeon } from '@prisma/adapter-neon'
import { PrismaClient, MonitorStatus, type Monitor } from './generated/prisma-client/client'

export const createPrisma = (databaseUrl: string) => {
	const adapter = new PrismaNeon({ connectionString: databaseUrl })

	return new PrismaClient({ adapter })
}

export { MonitorStatus }
export type { Monitor } 