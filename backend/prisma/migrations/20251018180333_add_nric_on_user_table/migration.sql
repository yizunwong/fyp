/*
  Warnings:

  - A unique constraint covering the columns `[nric]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nric` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nric" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_nric_key" ON "User"("nric");
