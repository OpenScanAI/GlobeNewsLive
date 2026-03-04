/**
 * Headline Memory Service (RAG)
 * Vector-based semantic search for historical headlines
 */

export interface HeadlineDocument {
  id: string;
  title: string;
  summary?: string;
  source: string;
  category: string;
  severity: string;
  timestamp: Date;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: HeadlineDocument;
  score: number;
}

// Simple in-memory vector store (replace with Pinecone/Weaviate in production)
class VectorStore {
  private documents: HeadlineDocument[] = [];
  private maxSize: number;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  async add(document: HeadlineDocument): Promise<void> {
    // Generate embedding if not provided
    if (!document.embedding) {
      document.embedding = await this.generateEmbedding(document.title + ' ' + (document.summary || ''));
    }

    this.documents.push(document);

    // Trim if exceeding max size (remove oldest)
    if (this.documents.length > this.maxSize) {
      this.documents.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      this.documents = this.documents.slice(-this.maxSize);
    }
  }

  async search(query: string, topK: number = 5): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const results = this.documents
      .map(doc => ({
        document: doc,
        score: this.cosineSimilarity(queryEmbedding, doc.embedding || []),
      }))
      .filter(r => r.score > 0.5) // Minimum similarity threshold
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  async searchByVector(embedding: number[], topK: number = 5): Promise<SearchResult[]> {
    const results = this.documents
      .map(doc => ({
        document: doc,
        score: this.cosineSimilarity(embedding, doc.embedding || []),
      }))
      .filter(r => r.score > 0.5)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return results;
  }

  // Simple TF-IDF-like embedding (replace with real embeddings in production)
  private async generateEmbedding(text: string): Promise<number[]> {
    // This is a simplified embedding - in production use:
    // - OpenAI embeddings API
    // - Local embeddings via transformers.js
    // - Ollama embeddings
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
    
    // Create a simple bag-of-words vector (128 dimensions)
    const vector = new Array(128).fill(0);
    
    words.forEach((word, i) => {
      // Simple hash-based index
      const index = this.hashString(word) % 128;
      vector[index] += 1;
    });

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (magnitude > 0) {
      return vector.map(v => v / magnitude);
    }
    
    return vector;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getStats(): { total: number; oldest: Date | null; newest: Date | null } {
    if (this.documents.length === 0) {
      return { total: 0, oldest: null, newest: null };
    }
    
    const sorted = [...this.documents].sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );
    
    return {
      total: this.documents.length,
      oldest: sorted[0].timestamp,
      newest: sorted[sorted.length - 1].timestamp,
    };
  }

  clear(): void {
    this.documents = [];
  }
}

// Singleton instance
const vectorStore = new VectorStore();

// Add headline to memory
export async function addToMemory(headline: HeadlineDocument): Promise<void> {
  await vectorStore.add(headline);
}

// Search memory for similar headlines
export async function searchMemory(
  query: string,
  options: { topK?: number; category?: string; timeRange?: number } = {}
): Promise<SearchResult[]> {
  const { topK = 5, category, timeRange } = options;
  
  let results = await vectorStore.search(query, topK * 2); // Get more for filtering
  
  // Apply filters
  if (category) {
    results = results.filter(r => r.document.category === category);
  }
  
  if (timeRange) {
    const cutoff = new Date(Date.now() - timeRange);
    results = results.filter(r => r.document.timestamp >= cutoff);
  }
  
  return results.slice(0, topK);
}

// Find related headlines
export async function findRelated(
  headlineId: string,
  topK: number = 5
): Promise<SearchResult[]> {
  // Find the source document
  const source = vectorStore['documents'].find(d => d.id === headlineId);
  if (!source || !source.embedding) {
    return [];
  }
  
  return vectorStore.searchByVector(source.embedding, topK);
}

// Get memory statistics
export function getMemoryStats(): { total: number; oldest: Date | null; newest: Date | null } {
  return vectorStore.getStats();
}

// Clear all memory
export function clearMemory(): void {
  vectorStore.clear();
}

// Batch add headlines
export async function batchAddToMemory(headlines: HeadlineDocument[]): Promise<void> {
  for (const headline of headlines) {
    await vectorStore.add(headline);
  }
}
