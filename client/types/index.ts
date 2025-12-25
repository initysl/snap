// Document types
export interface DocumentResponse {
  id: string;
  text?: string;
  metadata: Record<string, any>;
}

export interface UpdateRequest {
  text: string | null;
  metadata?: Record<string, any>;
}

export interface DeleteBatchRequest {
  ids: string[];
}

export interface StatsResponse {
  total_documents: number;
}

// Ingest types
export interface IngestRequest {
  text: string | string[];
  metadata?: Record<string, any>;
}

export interface IngestResponse {
  id: string | string[];
}

// Search types
export interface SearchRequest {
  query: string;
  top_k?: number;
  where?: Record<string, any> | null;
  where_document?: Record<string, any> | null;
}

export interface SearchResult {
  id: string;
  text: string | null;
  metadata: Record<string, any>;
  distance: number | null;
}

export interface SearchResponse {
  results: SearchResult[];
}
