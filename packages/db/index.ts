import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from './generated/prisma-client/client'

export const createPrisma = (d1: D1Database) => {
	const adapter = new PrismaD1(d1)

	return new PrismaClient({ adapter })
}

export const MonitorStatus = {
	UP: 'UP',
	DOWN: 'DOWN',
} as const

export type MonitorStatus = (typeof MonitorStatus)[keyof typeof MonitorStatus]

export const MonitorType = {
	WEBSITE: 'WEBSITE',
	API: 'API',
} as const

export type MonitorType = (typeof MonitorType)[keyof typeof MonitorType]

export const HttpMethod = {
	GET: 'GET',
	POST: 'POST',
} as const

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod]

export const AlertType = {
	DOWN: 'DOWN',
	RECOVERY: 'RECOVERY',
} as const

export type AlertType = (typeof AlertType)[keyof typeof AlertType]

export const AlertStatus = {
	SENT: 'SENT',
	RESOLVED: 'RESOLVED',
} as const

export type AlertStatus = (typeof AlertStatus)[keyof typeof AlertStatus]

export type { Monitor, User, Alert, MonitorCheck } from './generated/prisma-client/client'
