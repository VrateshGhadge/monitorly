/*
  Warnings:

  - Added the required column `type` to the `Monitor` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MonitorType" AS ENUM ('WEBSITE', 'API');

-- CreateEnum
CREATE TYPE "HttpMethod" AS ENUM ('GET', 'POST');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('DOWN', 'RECOVERY');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('SENT', 'RESOLVED');

-- DropIndex
DROP INDEX "MonitorCheck_monitorId_idx";

-- AlterTable
ALTER TABLE "Monitor" ADD COLUMN     "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "method" "HttpMethod" NOT NULL DEFAULT 'GET',
ADD COLUMN     "type" "MonitorType" NOT NULL;

-- AlterTable
ALTER TABLE "MonitorCheck" ADD COLUMN     "errorMessage" TEXT;

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monitorId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_userId_createdAt_idx" ON "Alert"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Monitor_userId_idx" ON "Monitor"("userId");

-- CreateIndex
CREATE INDEX "MonitorCheck_monitorId_checkedAt_idx" ON "MonitorCheck"("monitorId", "checkedAt");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
