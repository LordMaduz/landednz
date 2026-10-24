-- Expand-only: KB LAST_VERIFIED date for the task sheet source line
ALTER TABLE "Task" ADD COLUMN "lastVerifiedAt" TIMESTAMP(3);
