-- pgvector: required by the embedding column (20260322000000_add_embedding_column)
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateEnum
CREATE TYPE "VisaType" AS ENUM ('AEWV', 'PARTNER_OF_STUDENT', 'GREEN_LIST_WORK', 'GREEN_LIST_RESIDENCE', 'OTHER');

-- CreateEnum
CREATE TYPE "City" AS ENUM ('AUCKLAND', 'WELLINGTON', 'CHRISTCHURCH', 'OTHER');

-- CreateEnum
CREATE TYPE "FamilySituation" AS ENUM ('SOLO', 'COUPLE_DUAL_WORK', 'COUPLE_CONSTRAINED', 'FAMILY_WITH_CHILDREN');

-- CreateEnum
CREATE TYPE "Occupation" AS ENUM ('TECHNOLOGY', 'HEALTHCARE', 'EDUCATION', 'FINANCE', 'TRADES', 'OTHER_PROFESSIONAL', 'SEEKING_WORK');

-- CreateEnum
CREATE TYPE "ArrivalTiming" AS ENUM ('PRE_ARRIVAL', 'RECENT', 'WEEKS_TWO_TO_EIGHT', 'OVER_TWO_MONTHS');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('FREE', 'PREMIUM');

-- CreateEnum
CREATE TYPE "DependencyType" AS ENUM ('HARD', 'SOFT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "CompletionMethod" AS ENUM ('USER_MARKED', 'BULK_OVERRIDE');

-- CreateEnum
CREATE TYPE "ChunkType" AS ENUM ('TASK_CONTENT', 'SETTLEMENT_CONTEXT', 'POLICY_REFERENCE');

-- CreateEnum
CREATE TYPE "ChatEntryPoint" AS ENUM ('TASK_CARD', 'ROADMAP', 'EMAIL_DEEPLINK', 'NAVIGATION');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('MONTHLY', 'SIX_MONTH');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "visaType" "VisaType" NOT NULL,
    "city" "City" NOT NULL,
    "familySituation" "FamilySituation" NOT NULL,
    "occupation" "Occupation" NOT NULL,
    "arrivalTiming" "ArrivalTiming" NOT NULL,
    "arrivalDate" TIMESTAMP(3),
    "personaKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" INTEGER NOT NULL,
    "basePriority" INTEGER NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "processingTime" TEXT,
    "governmentSourceUrl" TEXT NOT NULL,
    "taskType" "TaskType" NOT NULL DEFAULT 'FREE',
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "applicableVisaTypes" TEXT NOT NULL,
    "applicableFamilySituations" TEXT NOT NULL,
    "applicableOccupations" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL,
    "prerequisiteId" TEXT NOT NULL,
    "dependentId" TEXT NOT NULL,
    "dependencyType" "DependencyType" NOT NULL,

    CONSTRAINT "TaskDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskContentVariant" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "personaKey" TEXT NOT NULL,
    "consequenceLine" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "documentsRequired" TEXT NOT NULL,
    "commonMistakes" TEXT NOT NULL,
    "cost" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "aiPersonalisationPrompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskContentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoadmapEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priorityScore" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "completionMethod" "CompletionMethod",
    "lastSyncVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmapEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseChunk" (
    "id" TEXT NOT NULL,
    "chunkKey" TEXT NOT NULL,
    "taskId" TEXT,
    "personaKey" TEXT,
    "chunkType" "ChunkType" NOT NULL,
    "content" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBaseChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBaseVersion" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,

    CONSTRAINT "KnowledgeBaseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entryPoint" "ChatEntryPoint" NOT NULL,
    "taskContext" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "retrievedChunks" TEXT,
    "guardrailFlags" TEXT,
    "level2Flags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "plan" "SubscriptionPlan",
    "revenueCatUserId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_prerequisiteId_dependentId_key" ON "TaskDependency"("prerequisiteId", "dependentId");

-- CreateIndex
CREATE UNIQUE INDEX "TaskContentVariant_taskId_personaKey_key" ON "TaskContentVariant"("taskId", "personaKey");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoadmapEntry_userId_taskId_key" ON "UserRoadmapEntry"("userId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseChunk_chunkKey_key" ON "KnowledgeBaseChunk"("chunkKey");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_revenueCatUserId_key" ON "Subscription"("revenueCatUserId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_prerequisiteId_fkey" FOREIGN KEY ("prerequisiteId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDependency" ADD CONSTRAINT "TaskDependency_dependentId_fkey" FOREIGN KEY ("dependentId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskContentVariant" ADD CONSTRAINT "TaskContentVariant_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmapEntry" ADD CONSTRAINT "UserRoadmapEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoadmapEntry" ADD CONSTRAINT "UserRoadmapEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
