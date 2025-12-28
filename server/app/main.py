from dotenv import load_dotenv
load_dotenv() 
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import api_router
from app.core.rate_limiter import init_limiter
import logging
from logging.handlers import RotatingFileHandler
from contextlib import asynccontextmanager


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        RotatingFileHandler('logs/app.log', maxBytes=10485760, backupCount=5), 
        # logging.StreamHandler(sys.stdout) 
    ]
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Snap API starting up...")
    await init_limiter()  
    logger.info("Rate limiter initialized")
    yield
    # Shutdown
    logger.info("Snap API shutting down...")


app = FastAPI(
    title="Snap API",
    description="A vector similarity search API for semantic document retrieval",
    version="1.0.0",
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-API-Key",
        "Accept",
    ],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    logger.info("Root endpoint accessed")
    return {"message": "Snap API", "version": "1.0.0", "status": "running"}


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)