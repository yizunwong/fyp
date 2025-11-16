/*
  Warnings:

  - A unique constraint covering the columns `[produceId]` on the table `QRCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QRCode_produceId_key" ON "QRCode"("produceId");
