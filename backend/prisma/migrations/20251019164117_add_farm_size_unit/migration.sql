-- CreateEnum
CREATE TYPE "AreaUnit" AS ENUM ('HECTARE', 'ACRE', 'SQUARE_METER');

-- AlterTable
ALTER TABLE "Farm" ADD COLUMN     "sizeUnit" "AreaUnit" NOT NULL DEFAULT 'HECTARE';
