/*
  Warnings:

  - You are about to drop the `RetailerDetails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Farm" DROP CONSTRAINT "Farm_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "FarmerProgram" DROP CONSTRAINT "FarmerProgram_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "Produce" DROP CONSTRAINT "Produce_retailerId_fkey";

-- DropForeignKey
ALTER TABLE "RetailerDetails" DROP CONSTRAINT "RetailerDetails_retailerId_fkey";

-- DropForeignKey
ALTER TABLE "Subsidy" DROP CONSTRAINT "Subsidy_farmerId_fkey";

-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "RetailerDetails";

-- CreateTable
CREATE TABLE "Farmer" (
    "id" TEXT NOT NULL,

    CONSTRAINT "Farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "businessAddress" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmReview" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "retailerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FarmReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmReview_farmId_idx" ON "FarmReview"("farmId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmReview_farmId_retailerId_key" ON "FarmReview"("farmId", "retailerId");

-- AddForeignKey
ALTER TABLE "Farmer" ADD CONSTRAINT "Farmer_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Retailer" ADD CONSTRAINT "Retailer_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerProgram" ADD CONSTRAINT "FarmerProgram_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "Farmer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmReview" ADD CONSTRAINT "FarmReview_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmReview" ADD CONSTRAINT "FarmReview_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agency" ADD CONSTRAINT "Agency_id_fkey" FOREIGN KEY ("id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_retailerId_fkey" FOREIGN KEY ("retailerId") REFERENCES "Retailer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
