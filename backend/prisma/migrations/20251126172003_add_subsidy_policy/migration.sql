-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('drought', 'flood', 'crop_loss', 'manual');

-- CreateEnum
CREATE TYPE "ProgramStatus" AS ENUM ('draft', 'active', 'archived');

-- CreateEnum
CREATE TYPE "TriggerOperator" AS ENUM ('>', '<', '>=', '<=');

-- CreateEnum
CREATE TYPE "WindowUnit" AS ENUM ('hours', 'days');

-- CreateEnum
CREATE TYPE "PayoutFrequency" AS ENUM ('per_trigger', 'annual', 'monthly');

-- CreateEnum
CREATE TYPE "BeneficiaryCategory" AS ENUM ('all_farmers', 'small_medium_farmers', 'organic_farmers', 'certified_farmers');

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ProgramType" NOT NULL DEFAULT 'manual',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'draft',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramEligibility" (
    "id" TEXT NOT NULL,
    "programsId" TEXT NOT NULL,
    "minFarmSize" DOUBLE PRECISION,
    "maxFarmSize" DOUBLE PRECISION,
    "states" TEXT[],
    "districts" TEXT[],
    "cropTypes" TEXT[],
    "certifications" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramEligibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnvironmentalTrigger" (
    "id" TEXT NOT NULL,
    "programsId" TEXT NOT NULL,
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
    "programsId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "frequency" "PayoutFrequency" NOT NULL,
    "maxCap" DOUBLE PRECISION NOT NULL,
    "beneficiaryCategory" "BeneficiaryCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Program_status_type_idx" ON "Program"("status", "type");

-- CreateIndex
CREATE INDEX "Program_startDate_endDate_idx" ON "Program"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramEligibility_programsId_key" ON "ProgramEligibility"("programsId");

-- CreateIndex
CREATE INDEX "EnvironmentalTrigger_programsId_idx" ON "EnvironmentalTrigger"("programsId");

-- CreateIndex
CREATE UNIQUE INDEX "PayoutRule_programsId_key" ON "PayoutRule"("programsId");

-- AddForeignKey
ALTER TABLE "ProgramEligibility" ADD CONSTRAINT "ProgramEligibility_programsId_fkey" FOREIGN KEY ("programsId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvironmentalTrigger" ADD CONSTRAINT "EnvironmentalTrigger_programsId_fkey" FOREIGN KEY ("programsId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayoutRule" ADD CONSTRAINT "PayoutRule_programsId_fkey" FOREIGN KEY ("programsId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
