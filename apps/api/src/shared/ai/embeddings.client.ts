// OpenAI embeddings client — the ONLY file importing openai package
// Mirrors isolation pattern of claude.client.ts for @anthropic-ai/sdk
// Model: text-embedding-3-small — 1536 dimensions (exact spec match)

import OpenAI from 'openai';
import { config } from '../config';

const client = new OpenAI({ apiKey: config.openaiApiKey });

// Generate a 1536-dimension embedding vector for the given text.
// Used by generate-embeddings.ts (script) and retrieveChunks() (RAG pipeline).
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0].embedding;
}
