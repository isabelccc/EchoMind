from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import api_router
from app.services.websocket_manager import WebSocketManager
from app.services.audio_processor import AudioProcessor
from app.services.llm_processor import LLMProcessor

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global instances
websocket_manager = WebSocketManager()
audio_processor = AudioProcessor()
llm_processor = LLMProcessor()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting EchoMind backend...")
    await websocket_manager.startup()
    await audio_processor.startup()
    await llm_processor.startup()
    logger.info("EchoMind backend started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down EchoMind backend...")
    await websocket_manager.shutdown()
    await audio_processor.shutdown()
    await llm_processor.shutdown()
    logger.info("EchoMind backend shutdown complete")

# Create FastAPI app
app = FastAPI(
    title="EchoMind API",
    description="AI-Driven Live Call Insights Platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "EchoMind API is running",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "services": {
            "websocket_manager": websocket_manager.is_healthy(),
            "audio_processor": audio_processor.is_healthy(),
            "llm_processor": llm_processor.is_healthy()
        }
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    await websocket_manager.connect(websocket, client_id)
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Process based on message type
            message_type = data.get("type")
            
            if message_type == "audio_chunk":
                # Process audio chunk
                audio_data = data.get("audio")
                session_id = data.get("session_id")
                
                # Convert audio to text
                transcript = await audio_processor.process_audio_chunk(
                    audio_data, session_id
                )
                
                if transcript:
                    # Generate insights using LLM
                    insights = await llm_processor.generate_insights(
                        transcript, session_id
                    )
                    
                    # Send insights back to client
                    await websocket_manager.send_message(
                        client_id,
                        {
                            "type": "insights",
                            "transcript": transcript,
                            "insights": insights,
                            "timestamp": data.get("timestamp")
                        }
                    )
            
            elif message_type == "call_start":
                # Initialize new call session
                session_id = data.get("session_id")
                await websocket_manager.initialize_session(client_id, session_id)
                
            elif message_type == "call_end":
                # Finalize call session
                session_id = data.get("session_id")
                await websocket_manager.finalize_session(client_id, session_id)
                
    except WebSocketDisconnect:
        await websocket_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error for client {client_id}: {e}")
        await websocket_manager.disconnect(client_id)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    ) 