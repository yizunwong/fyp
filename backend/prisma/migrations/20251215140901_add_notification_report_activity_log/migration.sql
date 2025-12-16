/*
  Warnings:

  - Added the required column `updatedAt` to the `FarmDocument` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LandDocumentVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FARM_VERIFIED', 'FARM_REJECTED', 'SUBSIDY_APPROVED', 'SUBSIDY_REJECTED', 'SUBSIDY_DISBURSED', 'PROGRAM_ENROLLED', 'DOCUMENT_VERIFIED', 'DOCUMENT_REJECTED', 'SYSTEM', 'GENERAL');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('FARM_SUMMARY', 'SUBSIDY_REPORT', 'PRODUCE_REPORT', 'PROGRAM_REPORT', 'FINANCIAL_REPORT', 'ACTIVITY_REPORT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('GENERATING', 'COMPLETED', 'FAILED');

-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "FarmDocument" ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "verificationStatus" "LandDocumentVerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "relatedEntityType" TEXT,
    "relatedEntityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "parameters" JSONB,
    "fileUrl" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'GENERATING',
    "errorMessage" TEXT,
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_createdAt_idx" ON "ActivityLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ActivityLog_action_idx" ON "ActivityLog"("action");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Report_userId_createdAt_idx" ON "Report"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reportType_idx" ON "Report"("reportType");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "FarmDocument_verificationStatus_idx" ON "FarmDocument"("verificationStatus");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
