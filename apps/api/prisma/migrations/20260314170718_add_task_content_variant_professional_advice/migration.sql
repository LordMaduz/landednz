-- AlterTable
ALTER TABLE "TaskContentVariant" ADD COLUMN     "professionalAdviceNote" TEXT,
ADD COLUMN     "professionalAdviceRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchOuts" TEXT NOT NULL DEFAULT '[]';
