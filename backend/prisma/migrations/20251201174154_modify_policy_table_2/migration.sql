/*
  Warnings:

  - You are about to drop the column `beneficiaryCategory` on the `PayoutRule` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `PayoutRule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PayoutRule" DROP COLUMN "beneficiaryCategory",
DROP COLUMN "frequency";

-- DropEnum
DROP TYPE "BeneficiaryCategory";

-- DropEnum
DROP TYPE "PayoutFrequency";
