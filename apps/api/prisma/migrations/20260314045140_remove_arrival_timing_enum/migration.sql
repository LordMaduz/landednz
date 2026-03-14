/*
  Warnings:

  - You are about to drop the column `arrivalTiming` on the `UserProfile` table. All the data in the column will be lost.
  - Made the column `arrivalDate` on table `UserProfile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "arrivalTiming",
ALTER COLUMN "arrivalDate" SET NOT NULL;

-- DropEnum
DROP TYPE "ArrivalTiming";
