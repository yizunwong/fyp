-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('drought', 'flood', 'crop_loss', 'manual');

-- CreateEnum
CREATE TYPE "PolicyStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "TriggerOperator" AS ENUM ('>', '<', '>=', '<=');

-- CreateEnum
CREATE TYPE "WindowUnit" AS ENUM ('hours', 'days');

-- CreateEnum
CREATE TYPE "PayoutFrequency" AS ENUM ('per_trigger', 'annual', 'monthly');

-- CreateEnum
CREATE TYPE "BeneficiaryCategory" AS ENUM ('all_farmers', 'small_medium_farmers', 'organic_farmers', 'certified_farmers');

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "PolicyType" NOT NULL DEFAULT 'manual',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyEligibility" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "minFarmSize" DOUBLE PRECISION,
    "maxFarmSize" DOUBLE PRECISION,
    "states" TEXT[],
    "districts" TEXT[],
    "cropTypes" TEXT[],
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalTrigger" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "operator" "TriggerOperator" NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "windowValue" DOUBLE PRECISION NOT NULL,
    "windowUnit" "WindowUnit" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnvironmentalTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRule" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "PayoutFrequency" NOT NULL,
    "maxCap" DOUBLE PRECISION NOT NULL,
    "beneficiaryCategory" "BeneficiaryCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Policy_status_type_idx" ON "Policy"("status", "type");

-- CreateIndex
CREATE INDEX "Policy_startDate_endDate_idx" ON "Policy"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyEligibility_policyId_key" ON "PolicyEligibility"("policyId");

-- CreateIndex
CREATE INDEX "EnvironmentalTrigger_policyId_idx" ON "EnvironmentalTrigger"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRule_policyId_key" ON "PayoutRule"("policyId");

-- AddForeignKey
ALTER TABLE "PolicyEligibility" ADD CONSTRAINT "PolicyEligibility_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalTrigger" ADD CONSTRAINT "EnvironmentalTrigger_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRule" ADD CONSTRAINT "PayoutRule_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
