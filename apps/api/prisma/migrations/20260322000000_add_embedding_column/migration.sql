-- Add vector embedding column to KnowledgeBaseChunk
-- C16: pgvector columns must be added via raw SQL migration — not Prisma schema syntax
-- Dimensions: 1536 — matches OpenAI text-embedding-3-small output
-- ivfflat index is NOT created here — must run manually AFTER all embeddings are loaded (C05)
ALTER TABLE "KnowledgeBaseChunk" ADD COLUMN IF NOT EXISTS embedding vector(1536);
