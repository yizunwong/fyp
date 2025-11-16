/*
  Warnings:

  - Added the required column `qrPublicId` to the `QRCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qrUrl` to the `QRCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QRCode" ADD COLUMN     "qrPublicId" TEXT NOT NULL,
ADD COLUMN     "qrUrl" TEXT NOT NULL;
