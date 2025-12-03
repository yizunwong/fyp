-- CreateEnum
CREATE TYPE "FarmVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "verificationStatus" "FarmVerificationStatus" NOT NULL DEFAULT 'PENDING';
