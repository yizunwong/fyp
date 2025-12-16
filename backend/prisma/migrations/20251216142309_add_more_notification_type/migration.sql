-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'SUBSIDY_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'BATCH_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'BATCH_ARRIVED';
ALTER TYPE "NotificationType" ADD VALUE 'BATCH_VERIFIED';
