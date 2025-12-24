from fastapi import APIRouter, Depends, HTTPException
from app.schemas.search import SearchRequest, SearchResponse
from app.dependencies import vector_store
from app.core.security import verify_api_key
from app.services.vector_store import VectorStoreError
from app.core.rate_limiter import rate_limit

router = APIRouter(prefix="/search", tags=["search"], dependencies=[Depends(rate_limit), Depends(verify_api_key)] )

@router.post("/", response_model=SearchResponse)
def search_document(payload: SearchRequest):
    try:
        results = vector_store.search(
            query=payload.query,
            top_k=payload.top_k,
            where=payload.where,
            where_document=payload.where_document
        )
        return {"results": results}
    except VectorStoreError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
