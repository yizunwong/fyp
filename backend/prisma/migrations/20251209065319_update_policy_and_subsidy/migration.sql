/*
  Warnings:

  - A unique constraint covering the columns `[onchainId]` on the table `Policy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `onchainId` to the `Policy` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubsidyEvidenceType" AS ENUM ('PHOTO', 'PDF');

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "onchainId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SubsidyEvidence" (
    "id" TEXT NOT NULL,
    "subsidyId" TEXT NOT NULL,
    "type" "SubsidyEvidenceType" NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubsidyEvidence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubsidyEvidence_subsidyId_idx" ON "SubsidyEvidence"("subsidyId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_onchainId_key" ON "Policy"("onchainId");

-- AddForeignKey
ALTER TABLE "SubsidyEvidence" ADD CONSTRAINT "SubsidyEvidence_subsidyId_fkey" FOREIGN KEY ("subsidyId") REFERENCES "Subsidy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
