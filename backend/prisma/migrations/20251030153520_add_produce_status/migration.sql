-- CreateEnum
CREATE TYPE "ProduceStatus" AS ENUM ('DRAFT', 'PENDING_CHAIN', 'ONCHAIN_CONFIRMED', 'IN_TRANSIT', 'VERIFIED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "retailerId" TEXT,
ADD COLUMN     "status" "ProduceStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "Produce_status_harvestDate_idx" ON "Produce"("status", "harvestDate");

-- CreateIndex
CREATE INDEX "Produce_retailerId_status_idx" ON "Produce"("retailerId", "status");

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
