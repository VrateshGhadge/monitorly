-- AlterTable
ALTER TABLE "MonitorCheck" ALTER COLUMN "statusCode" DROP NOT NULL,
ALTER COLUMN "responseTime" DROP NOT NULL;
