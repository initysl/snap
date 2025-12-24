from typing import List, Dict, Optional
import chromadb
import uuid
import logging

# Set up logging
logger = logging.getLogger(__name__)


class VectorStoreError(Exception):
    """Custom exception for VectorStore operations"""
    pass


class VectorStore:
    def __init__(self, embedding_service, collection_name: str = "vectors", persist_directory: str = "./chroma_db"):
        """
        Initialize VectorStore with ChromaDB.
        Args:
            embedding_service: Instance of EmbeddingService
            collection_name: Name of the ChromaDB collection
            persist_directory: Directory for persistent storage
        """
        try:
            self.embedding_service = embedding_service
            
            # Initialize ChromaDB persistent client
            self.client = chromadb.PersistentClient(path=persist_directory)
            
            # Get or create collection
            self.collection = self.client.get_or_create_collection(
                name=collection_name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info(f"VectorStore initialized with collection: {collection_name}")
        except Exception as e:
            logger.error(f"Failed to initialize VectorStore: {str(e)}")
            raise VectorStoreError(f"Initialization failed: {str(e)}")

    def add(self, text: str, metadata: Optional[Dict] = None, vector_id: Optional[str] = None) -> str:
        """
        Add a text with optional metadata to the vector store.
        Args:
            text: Text content to embed and store
            metadata: Optional metadata dictionary
            vector_id: Optional custom ID (generates UUID if not provided)
        Returns:
            The vector ID (str)
        """
        try:
            if not text or not text.strip():
                raise ValueError("Text cannot be empty")
            
            if not vector_id:
                vector_id = str(uuid.uuid4())
            
            # Generate embedding
            embedding = self.embedding_service.embed(text)
            
            # Add to collection
            self.collection.add(
                ids=[vector_id],
                embeddings=[embedding],
                metadatas=[metadata or {}],
                documents=[text]
            )
            
            logger.info(f"Successfully added document with ID: {vector_id}")
            return vector_id
            
        except ValueError as e:
            logger.error(f"Validation error in add(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to add document: {str(e)}")
            raise VectorStoreError(f"Failed to add document: {str(e)}")
    
    def add_batch(self, texts: List[str], metadatas: Optional[List[Dict]] = None, vector_ids: Optional[List[str]] = None) -> List[str]:
        """
        Add multiple texts in batch for better performance.
        Args:
            texts: List of text contents
            metadatas: Optional list of metadata dicts
            vector_ids: Optional list of custom IDs
        Returns:
            List of vector IDs
        """
        try:
            if not texts or len(texts) == 0:
                raise ValueError("Texts list cannot be empty")
            
            # Validate all texts are non-empty
            if any(not text or not text.strip() for text in texts):
                raise ValueError("All texts must be non-empty")
            
            if not vector_ids:
                vector_ids = [str(uuid.uuid4()) for _ in texts]
            
            if len(vector_ids) != len(texts):
                raise ValueError("Number of vector_ids must match number of texts")
            
            # Don't pass empty metadata dicts
            if metadatas and all(metadatas):
                if len(metadatas) != len(texts):
                    raise ValueError("Number of metadatas must match number of texts")
                metadata_param = metadatas
            else:
                metadata_param = None
            
            # Generate embeddings in batch
            embeddings = [self.embedding_service.embed(text) for text in texts]
            
            # Add batch to collection
            if metadata_param:
                self.collection.add(
                    ids=vector_ids,
                    embeddings=embeddings,
                    metadatas=metadata_param, # type: ignore
                    documents=texts
                )
            else:
                self.collection.add(
                    ids=vector_ids,
                    embeddings=embeddings,
                    documents=texts
                )
            
            logger.info(f"Successfully added {len(vector_ids)} documents in batch")
            return vector_ids
            
        except ValueError as e:
            logger.error(f"Validation error in add_batch(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to add batch: {str(e)}")
            raise VectorStoreError(f"Failed to add batch: {str(e)}")
        
    def search(self, query: str, top_k: int = 5, where: Optional[Dict] = None, where_document: Optional[Dict] = None) -> List[Dict]:
        """
        Search for top_k most similar vectors to the query.
        Args:
            query: Search query text
            top_k: Number of results to return
            where: Optional metadata filter (e.g., {"category": "news"})
            where_document: Optional document content filter
        Returns:
            List of dicts with id, text, metadata, and distance
        """
        try:
            if not query or not query.strip():
                raise ValueError("Query cannot be empty")
            
            if top_k <= 0:
                raise ValueError("top_k must be greater than 0")
            
            # Generate query embedding
            query_embedding = self.embedding_service.embed(query)
            
            # Query collection
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where=where,
                where_document=where_document
            )
            
            # Format results
            hits = []
            if results["ids"] and results["ids"][0]:
                for i in range(len(results["ids"][0])):
                    hits.append({
                        "id": results["ids"][0][i],
                        "text": results["documents"][0][i] if results["documents"] else None,
                        "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                        "distance": results["distances"][0][i] if results["distances"] else None
                    })
            
            logger.info(f"Search completed, found {len(hits)} results")
            return hits
            
        except ValueError as e:
            logger.error(f"Validation error in search(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise VectorStoreError(f"Search failed: {str(e)}")
    
    def get_by_id(self, vector_id: str) -> Optional[Dict]:
        """
        Retrieve a specific vector by its ID.
        Args:
            vector_id: The vector ID to retrieve
        Returns:
            Dict with id, text, metadata, or None if not found
        """
        try:
            if not vector_id or not vector_id.strip():
                raise ValueError("vector_id cannot be empty")
            
            result = self.collection.get(
                ids=[vector_id],
                include=["documents", "metadatas", "embeddings"]
            )
            
            if result["ids"]:
                logger.info(f"Successfully retrieved document with ID: {vector_id}")
                return {
                    "id": result["ids"][0],
                    "text": result["documents"][0] if result["documents"] else None,
                    "metadata": result["metadatas"][0] if result["metadatas"] else {},
                }
            
            logger.warning(f"Document not found with ID: {vector_id}")
            return None
            
        except ValueError as e:
            logger.error(f"Validation error in get_by_id(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to get document by ID: {str(e)}")
            raise VectorStoreError(f"Failed to get document: {str(e)}")
    
    def update(self, vector_id: str, text: Optional[str] = None, metadata: Optional[Dict] = None):
        """
        Update an existing vector's text and/or metadata.
        Args:
            vector_id: ID of the vector to update
            text: New text content (will regenerate embedding)
            metadata: New metadata
        """
        try:
            if not vector_id or not vector_id.strip():
                raise ValueError("vector_id cannot be empty")
            
            if text is None and metadata is None:
                raise ValueError("Must provide either text or metadata to update")
            
            if text is not None and not text.strip():
                raise ValueError("Text cannot be empty")
            
            # Check if document exists
            existing = self.get_by_id(vector_id)
            if not existing:
                raise ValueError(f"Document with ID {vector_id} not found")
            
            update_params = {"ids": [vector_id]}
            
            if text is not None:
                embedding = self.embedding_service.embed(text)
                update_params["embeddings"] = [embedding]
                update_params["documents"] = [text]
            
            if metadata is not None:
                update_params["metadatas"] = [metadata] # type: ignore
            
            self.collection.update(**update_params) # type: ignore
            logger.info(f"Successfully updated document with ID: {vector_id}")
            
        except ValueError as e:
            logger.error(f"Validation error in update(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to update document: {str(e)}")
            raise VectorStoreError(f"Failed to update document: {str(e)}")
    
    def delete(self, vector_id: str):
        """
        Delete a vector by its ID.
        Args:
            vector_id: The vector ID to delete
        """
        try:
            if not vector_id or not vector_id.strip():
                raise ValueError("vector_id cannot be empty")
            
            # Check if document exists before deleting
            existing = self.get_by_id(vector_id)
            if not existing:
                logger.warning(f"Attempted to delete non-existent document: {vector_id}")
                raise ValueError(f"Document with ID {vector_id} not found")
            
            self.collection.delete(ids=[vector_id])
            logger.info(f"Successfully deleted document with ID: {vector_id}")
            
        except ValueError as e:
            logger.error(f"Validation error in delete(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            raise VectorStoreError(f"Failed to delete document: {str(e)}")
    
    def delete_batch(self, vector_ids: List[str]):
        """
        Delete multiple vectors by their IDs.
        Args:
            vector_ids: List of vector IDs to delete
        """
        try:
            if not vector_ids or len(vector_ids) == 0:
                raise ValueError("vector_ids list cannot be empty")
            
            if any(not vid or not vid.strip() for vid in vector_ids):
                raise ValueError("All vector IDs must be non-empty")
            
            self.collection.delete(ids=vector_ids)
            logger.info(f"Successfully deleted {len(vector_ids)} documents in batch")
            
        except ValueError as e:
            logger.error(f"Validation error in delete_batch(): {str(e)}")
            raise VectorStoreError(f"Validation error: {str(e)}")
        except Exception as e:
            logger.error(f"Failed to delete batch: {str(e)}")
            raise VectorStoreError(f"Failed to delete batch: {str(e)}")
    
    def count(self) -> int:
        """
        Get the total number of vectors in the collection.
        Returns:
            Count of vectors
        """
        try:
            count = self.collection.count()
            logger.info(f"Collection contains {count} documents")
            return count
        except Exception as e:
            logger.error(f"Failed to get count: {str(e)}")
            raise VectorStoreError(f"Failed to get count: {str(e)}")
    
    def clear(self):
        """
        Delete all vectors from the collection.
        """
        try:
            # Delete and recreate collection
            self.client.delete_collection(name=self.collection.name)
            self.collection = self.client.get_or_create_collection(
                name=self.collection.name,
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("Successfully cleared all documents from collection")
        except Exception as e:
            logger.error(f"Failed to clear collection: {str(e)}")
            raise VectorStoreError(f"Failed to clear collection: {str(e)}")