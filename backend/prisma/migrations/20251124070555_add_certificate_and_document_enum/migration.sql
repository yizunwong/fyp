/*
  Warnings:

  - Changed the type of `type` on the `ProduceCertificate` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CertificationType" AS ENUM ('HALAL', 'GMP', 'HACCP', 'ISO_22000', 'ORGANIC', 'PESTICIDE_FREE');

-- CreateEnum
CREATE TYPE "LandDocumentType" AS ENUM ('GERAN_TANAH', 'PAJAK_GADAI', 'SURAT_TAWARAN_TANAH', 'SURAT_PENGESAHAN_PEMAJU', 'SURAT_PENGESAHAN_PENGHULU', 'LEASE_AGREEMENT', 'LAND_PERMISSION', 'LAND_TAX_RECEIPT', 'SURAT_HAKMILIK_SEMENTARA', 'OTHERS');

-- AlterTable
ALTER TABLE "ProduceCertificate" DROP COLUMN "type",
ADD COLUMN     "type" "CertificationType" NOT NULL;

-- CreateTable
CREATE TABLE "FarmDocument" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "type" "LandDocumentType" NOT NULL,
    "ipfsUrl" TEXT NOT NULL,
    "metadata" JSONB,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmDocument_farmId_idx" ON "FarmDocument"("farmId");

-- CreateIndex
CREATE INDEX "FarmDocument_type_idx" ON "FarmDocument"("type");

-- CreateIndex
CREATE INDEX "ProduceCertificate_type_idx" ON "ProduceCertificate"("type");

-- AddForeignKey
ALTER TABLE "FarmDocument" ADD CONSTRAINT "FarmDocument_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
