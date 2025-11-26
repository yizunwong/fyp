-- AlterTable
ALTER TABLE "Subsidy" ADD COLUMN     "metadataHash" VARCHAR(66),
ADD COLUMN     "onChainClaimId" BIGINT,
ADD COLUMN     "onChainTxHash" VARCHAR(66),
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "policyId" TEXT,
ADD COLUMN     "rejectionReason" TEXT;

-- CreateIndex
CREATE INDEX "Subsidy_policyId_idx" ON "Subsidy"("policyId");

-- CreateIndex
CREATE INDEX "Subsidy_status_idx" ON "Subsidy"("status");

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
