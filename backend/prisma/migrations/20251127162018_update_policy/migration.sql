/*
  Warnings:

  - You are about to drop the `EnvironmentalTrigger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "EnvironmentalTrigger" DROP CONSTRAINT "EnvironmentalTrigger_programsId_fkey";

-- DropTable
DROP TABLE "EnvironmentalTrigger";

-- DropEnum
DROP TYPE "TriggerOperator";

-- DropEnum
DROP TYPE "WindowUnit";
