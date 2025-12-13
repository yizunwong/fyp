/*
  Warnings:

  - The values [VERIFIED] on the enum `ProduceStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[produceId,retailerId]` on the table `FarmReview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `produceId` to the `FarmReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProduceStatus_new" AS ENUM ('DRAFT', 'PENDING_CHAIN', 'ONCHAIN_CONFIRMED', 'IN_TRANSIT', 'ARRIVED', 'RETAILER_VERIFIED', 'ARCHIVED');
ALTER TABLE "public"."Produce" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Produce" ALTER COLUMN "status" TYPE "ProduceStatus_new" USING ("status"::text::"ProduceStatus_new");
ALTER TYPE "ProduceStatus" RENAME TO "ProduceStatus_old";
ALTER TYPE "ProduceStatus_new" RENAME TO "ProduceStatus";
DROP TYPE "public"."ProduceStatus_old";
ALTER TABLE "Produce" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- DropIndex
DROP INDEX "FarmReview_farmId_retailerId_key";

-- AlterTable
ALTER TABLE "FarmReview" ADD COLUMN     "produceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FarmReview_produceId_retailerId_key" ON "FarmReview"("produceId", "retailerId");

-- AddForeignKey
ALTER TABLE "FarmReview" ADD CONSTRAINT "FarmReview_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
