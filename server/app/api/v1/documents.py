from fastapi import APIRouter, HTTPException, Security
from app.schemas.documents import DocumentResponse, UpdateRequest, DeleteBatchRequest, StatsResponse
from app.dependencies import vector_store
from app.core.security import verify_api_key
from app.services.vector_store import VectorStoreError

router = APIRouter(prefix="/documents", tags=["Documents"])

@router.get("/{id}", response_model=DocumentResponse)
def get_document(id: str, api_key: str = Security(verify_api_key)):
    try:
        doc = vector_store.get_by_id(id)
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        return doc
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
def update_document(id: str, payload: UpdateRequest):
    try:
        vector_store.update(id, text=payload.text, metadata=payload.metadata)
        return {"message": "Document updated"}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{id}")
def delete_document(id: str):
    try:
        vector_store.delete(id)
        return {"message": "Document deleted"}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch/delete")
def delete_documents_batch(payload: DeleteBatchRequest):
    try:
        vector_store.delete_batch(payload.ids)
        return {"message": f"Deleted {len(payload.ids)} documents"}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/count", response_model=StatsResponse)
def get_stats():
    try:
        return {"total_documents": vector_store.count()}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear/all")
def clear_all():
    try:
        vector_store.clear()
        return {"message": "All documents cleared"}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))