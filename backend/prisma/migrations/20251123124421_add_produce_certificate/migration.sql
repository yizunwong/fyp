/*
  Warnings:

  - You are about to drop the column `certifications` on the `Produce` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Produce" DROP COLUMN "certifications";

-- CreateTable
CREATE TABLE "ProduceCertificate" (
    "id" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "ipfsUrl" TEXT NOT NULL,
    "verifiedOnChain" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProduceCertificate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProduceCertificate_produceId_idx" ON "ProduceCertificate"("produceId");

-- CreateIndex
CREATE INDEX "ProduceCertificate_type_idx" ON "ProduceCertificate"("type");

-- AddForeignKey
ALTER TABLE "ProduceCertificate" ADD CONSTRAINT "ProduceCertificate_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
