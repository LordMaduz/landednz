-- DropForeignKey
ALTER TABLE "TaskContentVariant" DROP CONSTRAINT "TaskContentVariant_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TaskDependency" DROP CONSTRAINT "TaskDependency_dependentId_fkey";

-- DropForeignKey
ALTER TABLE "TaskDependency" DROP CONSTRAINT "TaskDependency_prerequisiteId_fkey";

-- AlterTable
ALTER TABLE "KnowledgeBaseChunk" DROP COLUMN "personaKey";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "personaKey";

-- DropTable
DROP TABLE "KnowledgeBaseVersion";

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskContentVariant";

-- DropTable
DROP TABLE "TaskDependency";

-- DropEnum
DROP TYPE "DependencyType";

-- DropEnum
DROP TYPE "TaskType";
