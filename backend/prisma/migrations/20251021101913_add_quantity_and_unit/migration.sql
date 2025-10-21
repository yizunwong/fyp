-- CreateEnum
CREATE TYPE "ProduceUnit" AS ENUM ('KG', 'G', 'TONNE', 'PCS', 'BUNCH', 'TRAY', 'L', 'ML');

-- AlterTable
ALTER TABLE "Produce" ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "unit" "ProduceUnit" NOT NULL DEFAULT 'KG';
