-- CreateTable
CREATE TABLE "FarmerPolicy" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmerPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FarmerPolicy_policyId_idx" ON "FarmerPolicy"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "FarmerPolicy_farmerId_policyId_key" ON "FarmerPolicy"("farmerId", "policyId");

-- AddForeignKey
ALTER TABLE "FarmerPolicy" ADD CONSTRAINT "FarmerPolicy_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmerPolicy" ADD CONSTRAINT "FarmerPolicy_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
