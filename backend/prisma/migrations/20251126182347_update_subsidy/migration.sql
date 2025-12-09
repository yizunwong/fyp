-- AlterTable
ALTER TABLE "Subsidy" ADD COLUMN     "metadataHash" VARCHAR(66),
ADD COLUMN     "onChainClaimId" BIGINT,
ADD COLUMN     "onChainTxHash" VARCHAR(66),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "programsId" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX "Subsidy_programsId_idx" ON "Subsidy"("programsId");

-- CreateIndex
CREATE INDEX "Subsidy_status_idx" ON "Subsidy"("status");

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_programsId_fkey" FOREIGN KEY ("programsId") REFERENCES "Program"("id") ON DELETE SET NULL ON UPDATE CASCADE;
