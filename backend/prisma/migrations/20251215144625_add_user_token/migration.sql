/*
  Warnings:

  - You are about to drop the column `verified` on the `Retailer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "UserTokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "Retailer" DROP COLUMN "verified";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "status" "UserStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION';

-- CreateTable
CREATE TABLE "UserToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "type" "UserTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserToken_userId_type_idx" ON "UserToken"("userId", "type");

-- CreateIndex
CREATE INDEX "UserToken_tokenHash_type_idx" ON "UserToken"("tokenHash", "type");

-- CreateIndex
CREATE INDEX "UserToken_expiresAt_idx" ON "UserToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "UserToken" ADD CONSTRAINT "UserToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
