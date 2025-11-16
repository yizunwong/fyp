/*
  Warnings:

  - You are about to drop the column `code` on the `QRCode` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."QRCode_code_key";

-- AlterTable
ALTER TABLE "QRCode" DROP COLUMN "code";
