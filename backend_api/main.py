"""
Haraka.ai Backend API - Main Entry Point
==========================================

FastAPI application for the Haraka tele-rehabilitation system.
This server handles:
- Receiving session JSON payloads from the frontend (Edge AI)
- Hardware health checks (camera diagnostics)
- LLM integration for clinical report generation
- Whisper API integration for speech-to-text
- Amber flag verification for hallucination detection

Architecture:
- FastAPI for async REST API
- Pydantic for data validation
- OpenCV for camera diagnostics
- OpenAI/Google Cloud APIs for AI services

Author: Haraka.ai Team
Compliance: CNDP 09-08 (Zero-Recording Policy)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import API routers
from api.session import router as session_router
from api.health import router as health_router

# Import services
from services.llm_service import LLMService
from services.whisper_service import WhisperService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    
    Startup:
    - Initialize LLM service
    - Initialize Whisper service
    - Load prompts and medical context
    
    Shutdown:
    - Clean up resources
    - Close connections
    """
    # Startup logic
    print("🚀 Starting Haraka.ai Backend API...")
    
    # Initialize services
    llm_service = LLMService()
    whisper_service = WhisperService()
    
    # Store services in app state for dependency injection
    app.state.llm_service = llm_service
    app.state.whisper_service = whisper_service
    
    print("✅ Services initialized successfully")
    
    yield
    
    # Shutdown logic
    print("🛑 Shutting down Haraka.ai Backend API...")
    print("✅ Cleanup complete")


# Create FastAPI application
app = FastAPI(
    title="Haraka.ai Backend API",
    description="Tele-rehabilitation backend for Moroccan mobile medical units (UMMC-FMVS)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(session_router, prefix="/api/v1/session", tags=["Session"])
app.include_router(health_router, prefix="/api/v1/health", tags=["Health"])


@app.get("/")
async def root():
    """
    Root endpoint for API health check.
    
    Returns:
        dict: API status and information
    """
    return {
        "status": "online",
        "service": "Haraka.ai Backend API",
        "version": "1.0.0",
        "compliance": "CNDP 09-08 (Zero-Recording Policy)"
    }


if __name__ == "__main__":
    import uvicorn
    
    # Run the development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
