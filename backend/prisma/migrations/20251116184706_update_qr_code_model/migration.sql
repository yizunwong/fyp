/*
  Warnings:

  - You are about to drop the column `isPublicQR` on the `Produce` table. All the data in the column will be lost.
  - You are about to drop the column `qrPublicId` on the `QRCode` table. All the data in the column will be lost.
  - You are about to drop the column `qrUrl` on the `QRCode` table. All the data in the column will be lost.
  - Added the required column `verifyUrl` to the `QRCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Produce" DROP COLUMN "isPublicQR";

-- AlterTable
ALTER TABLE "QRCode" DROP COLUMN "qrPublicId",
DROP COLUMN "qrUrl",
ADD COLUMN     "isPublicQR" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "qrHash" TEXT,
ADD COLUMN     "verifyUrl" TEXT NOT NULL;
