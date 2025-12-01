/*
  Warnings:

  - You are about to drop the column `documents` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the column `certifications` on the `PolicyEligibility` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Farm" DROP COLUMN "documents";

-- AlterTable
ALTER TABLE "PolicyEligibility" DROP COLUMN "certifications",
ADD COLUMN     "landDocumentTypes" "LandDocumentType"[];
