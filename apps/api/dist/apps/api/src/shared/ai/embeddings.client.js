"use strict";
// OpenAI embeddings client — the ONLY file importing openai package
// Mirrors isolation pattern of claude.client.ts for @anthropic-ai/sdk
// Model: text-embedding-3-small — 1536 dimensions (exact spec match)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEmbedding = generateEmbedding;
const openai_1 = __importDefault(require("openai"));
const config_1 = require("../config");
const client = new openai_1.default({ apiKey: config_1.config.openaiApiKey });
// Generate a 1536-dimension embedding vector for the given text.
// Used by generate-embeddings.ts (script) and retrieveChunks() (RAG pipeline).
async function generateEmbedding(text) {
    const response = await client.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
    });
    return response.data[0].embedding;
}
//# sourceMappingURL=embeddings.client.js.map