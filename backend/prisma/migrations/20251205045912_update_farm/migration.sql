/*
  Warnings:

  - You are about to drop the column `location` on the `Farm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Produce" DROP CONSTRAINT "Produce_farmId_fkey";

-- DropForeignKey
ALTER TABLE "QRCode" DROP CONSTRAINT "QRCode_produceId_fkey";

-- DropForeignKey
ALTER TABLE "QRScan" DROP CONSTRAINT "QRScan_qrCodeId_fkey";

-- AlterTable
ALTER TABLE "Farm" DROP COLUMN "location",
ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "district" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "state" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
