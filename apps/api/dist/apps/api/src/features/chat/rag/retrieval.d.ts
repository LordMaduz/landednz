export interface RetrievalInput {
    query: string;
    personaKey: string;
    visaType: string;
    city: string;
    taskContext: string | null;
}
export interface RetrievedChunk {
    chunkKey: string;
    content: string;
    sourceUrl: string;
    sourceName: string;
    similarityScore: number;
}
export declare function retrieveChunks(input: RetrievalInput): Promise<RetrievedChunk[]>;
//# sourceMappingURL=retrieval.d.ts.map