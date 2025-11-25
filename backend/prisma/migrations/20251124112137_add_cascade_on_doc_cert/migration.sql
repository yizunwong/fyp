-- DropForeignKey
ALTER TABLE "FarmDocument" DROP CONSTRAINT "FarmDocument_farmId_fkey";

-- DropForeignKey
ALTER TABLE "ProduceCertificate" DROP CONSTRAINT "ProduceCertificate_produceId_fkey";

-- AddForeignKey
ALTER TABLE "ProduceCertificate" ADD CONSTRAINT "ProduceCertificate_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmDocument" ADD CONSTRAINT "FarmDocument_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
