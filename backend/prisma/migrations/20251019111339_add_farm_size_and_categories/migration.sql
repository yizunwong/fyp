/*
  Warnings:

  - Added the required column `size` to the `Farm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Produce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "produceCategories" TEXT[],
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "category" TEXT NOT NULL;
