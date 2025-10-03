-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('FARMER', 'RETAILER', 'GOVERMENT_AGENCY', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubsidyStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'DISBURSED');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
DROP COLUMN "role",
ADD COLUMN     "role" "UserRole" NOT NULL;

-- DropEnum
DROP TYPE "public"."Role";

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "documents" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produce" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "certifications" JSONB,
    "harvestDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Produce_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRCode" (
    "id" TEXT NOT NULL,
    "produceId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QRScan" (
    "id" TEXT NOT NULL,
    "qrCodeId" TEXT NOT NULL,
    "scannedById" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location" TEXT,

    CONSTRAINT "QRScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsidy" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "SubsidyStatus" NOT NULL DEFAULT 'PENDING',
    "weatherEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Subsidy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeatherEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "stationId" TEXT NOT NULL,
    "rainfall" DOUBLE PRECISION,
    "waterLevel" DOUBLE PRECISION,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produce_batchId_key" ON "Produce"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "QRCode_code_key" ON "QRCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Produce" ADD CONSTRAINT "Produce_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRCode" ADD CONSTRAINT "QRCode_produceId_fkey" FOREIGN KEY ("produceId") REFERENCES "Produce"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_qrCodeId_fkey" FOREIGN KEY ("qrCodeId") REFERENCES "QRCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QRScan" ADD CONSTRAINT "QRScan_scannedById_fkey" FOREIGN KEY ("scannedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsidy" ADD CONSTRAINT "Subsidy_weatherEventId_fkey" FOREIGN KEY ("weatherEventId") REFERENCES "WeatherEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
