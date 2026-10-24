-- Content platform, additive step (Plan 1 Task 5). Nothing dropped yet.
-- Written by hand from `prisma migrate diff`: the diff also drops the raw-SQL pgvector
-- embedding column and its ivfflat index (C16), which must stay.

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "contentVersion" TEXT,
ADD COLUMN     "usedItemIds" TEXT;

-- AlterTable
ALTER TABLE "KnowledgeBaseChunk" ADD COLUMN     "contentHash" TEXT,
ADD COLUMN     "embeddingMode" TEXT,
ADD COLUMN     "itemIds" TEXT,
ADD COLUMN     "sourceIds" TEXT,
ADD COLUMN     "when" JSONB;

-- AlterTable
ALTER TABLE "UserRoadmapEntry" ADD COLUMN     "contentVersion" TEXT;

-- CreateTable
CREATE TABLE "ContentRelease" (
    "version" TEXT NOT NULL,
    "builtAt" TIMESTAMP(3) NOT NULL,
    "servedFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRelease_pkey" PRIMARY KEY ("version")
);

-- UserRoadmapEntry.taskId is a plain content task id now. The Prisma relation to Task
-- stays until the Task table is dropped (Task 8) so legacy reads still type-check.
ALTER TABLE "UserRoadmapEntry" DROP CONSTRAINT "UserRoadmapEntry_taskId_fkey";
