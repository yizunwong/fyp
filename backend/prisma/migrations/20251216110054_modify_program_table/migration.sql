/*
  Warnings:

  - The values [archived] on the enum `ProgramStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProgramStatus_new" AS ENUM ('draft', 'active');
ALTER TABLE "public"."Program" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Program" ALTER COLUMN "status" TYPE "ProgramStatus_new" USING ("status"::text::"ProgramStatus_new");
ALTER TYPE "ProgramStatus" RENAME TO "ProgramStatus_old";
ALTER TYPE "ProgramStatus_new" RENAME TO "ProgramStatus";
DROP TYPE "public"."ProgramStatus_old";
ALTER TABLE "Program" ALTER COLUMN "status" SET DEFAULT 'draft';
COMMIT;
