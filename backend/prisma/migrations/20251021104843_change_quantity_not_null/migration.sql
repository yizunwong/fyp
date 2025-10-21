/*
  Warnings:

  - Made the column `quantity` on table `Produce` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Produce" ALTER COLUMN "quantity" SET NOT NULL;
