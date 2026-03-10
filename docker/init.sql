-- Initialize pgvector extension
-- This runs automatically when the PostgreSQL container starts for the first time
CREATE EXTENSION IF NOT EXISTS vector;