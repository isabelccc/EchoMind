from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import time

from app.core.logging import get_logger
from app.services.websocket_manager import WebSocketManager
from app.services.audio_processor import AudioProcessor
from app.services.llm_processor import LLMProcessor

# Create router
api_router = APIRouter()
logger = get_logger("api_routes")

# Pydantic models for request/response
class SessionCreate(BaseModel):
    session_id: str
    agent_id: Optional[str] = None
    customer_id: Optional[str] = None
    call_type: Optional[str] = "support"

class SessionResponse(BaseModel):
    session_id: str
    status: str
    created_at: float
    agent_id: Optional[str]
    customer_id: Optional[str]
    call_type: str

class InsightRequest(BaseModel):
    transcript: str
    session_id: str

class InsightResponse(BaseModel):
    transcript: str
    timestamp: float
    insights: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    services: Dict[str, bool]
    timestamp: float

class StatsResponse(BaseModel):
    websocket_stats: Dict[str, Any]
    audio_stats: Dict[str, Any]
    llm_stats: Dict[str, Any]
    timestamp: float

# Dependency injection for services
def get_websocket_manager() -> WebSocketManager:
    # This would be injected from the main app
    from main import websocket_manager
    return websocket_manager

def get_audio_processor() -> AudioProcessor:
    from main import audio_processor
    return audio_processor

def get_llm_processor() -> LLMProcessor:
    from main import llm_processor
    return llm_processor

# Health and monitoring endpoints
@api_router.get("/health", response_model=HealthResponse)
async def health_check(
    ws_manager: WebSocketManager = Depends(get_websocket_manager),
    audio_processor: AudioProcessor = Depends(get_audio_processor),
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Get system health status"""
    services = {
        "websocket_manager": ws_manager.is_healthy(),
        "audio_processor": audio_processor.is_healthy(),
        "llm_processor": llm_processor.is_healthy()
    }
    
    overall_status = "healthy" if all(services.values()) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        services=services,
        timestamp=time.time()
    )

@api_router.get("/stats", response_model=StatsResponse)
async def get_stats(
    ws_manager: WebSocketManager = Depends(get_websocket_manager),
    audio_processor: AudioProcessor = Depends(get_audio_processor),
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Get system statistics"""
    return StatsResponse(
        websocket_stats=ws_manager.get_stats(),
        audio_stats=audio_processor.get_stats(),
        llm_stats=llm_processor.get_stats(),
        timestamp=time.time()
    )

# Session management endpoints
@api_router.post("/sessions", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    ws_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Create a new call session"""
    try:
        # Validate session ID
        if not session_data.session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Session ID is required"
            )
        
        # Check if session already exists
        session_info = ws_manager.manager.get_session_info(session_data.session_id)
        if session_info["client_count"] > 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Session already exists"
            )
        
        logger.info("session_created", session_id=session_data.session_id)
        
        return SessionResponse(
            session_id=session_data.session_id,
            status="created",
            created_at=time.time(),
            agent_id=session_data.agent_id,
            customer_id=session_data.customer_id,
            call_type=session_data.call_type
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("session_creation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create session"
        )

@api_router.get("/sessions/{session_id}", response_model=Dict[str, Any])
async def get_session_info(
    session_id: str,
    ws_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get information about a specific session"""
    try:
        session_info = ws_manager.manager.get_session_info(session_id)
        return {
            "session_id": session_id,
            "info": session_info,
            "timestamp": time.time()
        }
    except Exception as e:
        logger.error("session_info_error", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session info"
        )

@api_router.delete("/sessions/{session_id}")
async def delete_session(
    session_id: str,
    ws_manager: WebSocketManager = Depends(get_websocket_manager),
    audio_processor: AudioProcessor = Depends(get_audio_processor),
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Delete a session and clean up resources"""
    try:
        # Clear session data from all processors
        audio_processor.clear_session(session_id)
        llm_processor.clear_session(session_id)
        
        # Disconnect all clients in the session
        session_info = ws_manager.manager.get_session_info(session_id)
        for client_id in session_info["clients"]:
            ws_manager.disconnect(client_id)
        
        logger.info("session_deleted", session_id=session_id)
        
        return {"message": "Session deleted successfully", "session_id": session_id}
        
    except Exception as e:
        logger.error("session_deletion_error", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete session"
        )

# Insight generation endpoints
@api_router.post("/insights", response_model=InsightResponse)
async def generate_insights(
    request: InsightRequest,
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Generate insights from a transcript"""
    try:
        if not request.transcript.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transcript cannot be empty"
            )
        
        # Generate insights
        insights = await llm_processor.generate_insights(
            request.transcript, 
            request.session_id
        )
        
        if "error" in insights:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=insights["error"]
            )
        
        return InsightResponse(**insights)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("insight_generation_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate insights"
        )

@api_router.get("/sessions/{session_id}/context")
async def get_session_context(
    session_id: str,
    audio_processor: AudioProcessor = Depends(get_audio_processor),
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Get conversation context for a session"""
    try:
        audio_context = audio_processor.get_session_context(session_id)
        llm_context = llm_processor.get_session_context(session_id)
        
        return {
            "session_id": session_id,
            "audio_context": audio_context,
            "llm_context": llm_context,
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error("context_retrieval_error", session_id=session_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get session context"
        )

# Analytics endpoints
@api_router.get("/analytics/sessions")
async def get_session_analytics(
    ws_manager: WebSocketManager = Depends(get_websocket_manager)
):
    """Get analytics about active sessions"""
    try:
        stats = ws_manager.get_stats()
        
        return {
            "active_sessions": stats["active_sessions"],
            "total_connections": stats["active_connections"],
            "uptime": stats["uptime"],
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error("analytics_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get analytics"
        )

@api_router.get("/analytics/performance")
async def get_performance_analytics(
    audio_processor: AudioProcessor = Depends(get_audio_processor),
    llm_processor: LLMProcessor = Depends(get_llm_processor)
):
    """Get performance analytics"""
    try:
        audio_stats = audio_processor.get_stats()
        llm_stats = llm_processor.get_stats()
        
        return {
            "audio_processing": {
                "active_sessions": audio_stats["active_sessions"],
                "total_contexts": audio_stats["total_contexts"],
                "healthy": audio_stats["healthy"]
            },
            "llm_processing": {
                "active_sessions": llm_stats["active_sessions"],
                "total_contexts": llm_stats["total_contexts"],
                "healthy": llm_stats["healthy"]
            },
            "timestamp": time.time()
        }
        
    except Exception as e:
        logger.error("performance_analytics_error", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get performance analytics"
        ) 