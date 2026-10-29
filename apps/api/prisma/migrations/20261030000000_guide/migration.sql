-- AlterTable (raw SQL: Prisma cannot declare a generated column)
ALTER TABLE "KnowledgeBaseChunk" ADD COLUMN "searchText" tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED;

-- CreateTable
CREATE TABLE "GuideConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "replyToId" TEXT,
    "text" TEXT NOT NULL,
    "parts" JSONB,
    "screenKind" TEXT NOT NULL,
    "taskKey" TEXT,
    "status" TEXT NOT NULL,
    "countsTowardCap" BOOLEAN NOT NULL DEFAULT true,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuideMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuideMemory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sourceMessageId" TEXT,
    "editedByUser" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuideMemory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSourceCache" (
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSourceCache_pkey" PRIMARY KEY ("url")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideConversation_userId_key" ON "GuideConversation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "GuideMessage_replyToId_key" ON "GuideMessage"("replyToId");

-- CreateIndex
CREATE INDEX "GuideMessage_conversationId_createdAt_idx" ON "GuideMessage"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "GuideMessage_conversationId_taskKey_idx" ON "GuideMessage"("conversationId", "taskKey");

-- CreateIndex
CREATE INDEX "GuideMemory_userId_idx" ON "GuideMemory"("userId");

-- CreateIndex
CREATE INDEX "kb_chunk_search_text_gin" ON "KnowledgeBaseChunk" USING GIN ("searchText");

-- AddForeignKey
ALTER TABLE "GuideConversation" ADD CONSTRAINT "GuideConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideMessage" ADD CONSTRAINT "GuideMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "GuideConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuideMemory" ADD CONSTRAINT "GuideMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- One streaming assistant answer per conversation (raw SQL: Prisma cannot declare partial indexes)
CREATE UNIQUE INDEX "guide_message_one_streaming" ON "GuideMessage" ("conversationId") WHERE status = 'streaming';
