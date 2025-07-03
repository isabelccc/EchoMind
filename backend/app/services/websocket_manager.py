import asyncio
import json
import time
from typing import Dict, Set, Optional, Any
from fastapi import WebSocket, WebSocketDisconnect
from app.core.logging import LoggerMixin
from app.core.config import settings

class ConnectionManager:
    """Manages WebSocket connections and message routing"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.client_sessions: Dict[str, str] = {}  # client_id -> session_id
        self.session_clients: Dict[str, Set[str]] = {}  # session_id -> set of client_ids
        self.connection_times: Dict[str, float] = {}
        self._healthy = True

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.connection_times[client_id] = time.time()
        self.logger.info("client_connected", client_id=client_id)

    def disconnect(self, client_id: str):
        """Disconnect a client"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
        
        # Remove from session tracking
        session_id = self.client_sessions.get(client_id)
        if session_id:
            if session_id in self.session_clients:
                self.session_clients[session_id].discard(client_id)
                if not self.session_clients[session_id]:
                    del self.session_clients[session_id]
            del self.client_sessions[client_id]
        
        if client_id in self.connection_times:
            del self.connection_times[client_id]
        
        self.logger.info("client_disconnected", client_id=client_id)

    async def send_message(self, client_id: str, message: Dict[str, Any]):
        """Send message to specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
                self.logger.debug("message_sent", client_id=client_id, message_type=message.get("type"))
            except Exception as e:
                self.logger.error("failed_to_send_message", client_id=client_id, error=str(e))
                self.disconnect(client_id)

    async def broadcast_to_session(self, session_id: str, message: Dict[str, Any]):
        """Broadcast message to all clients in a session"""
        if session_id in self.session_clients:
            for client_id in self.session_clients[session_id]:
                await self.send_message(client_id, message)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        disconnected_clients = []
        for client_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                self.logger.error("broadcast_failed", client_id=client_id, error=str(e))
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)

    def get_connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)

    def get_session_info(self, session_id: str) -> Dict[str, Any]:
        """Get information about a session"""
        if session_id not in self.session_clients:
            return {"session_id": session_id, "clients": [], "client_count": 0}
        
        clients = list(self.session_clients[session_id])
        return {
            "session_id": session_id,
            "clients": clients,
            "client_count": len(clients)
        }

class WebSocketManager(LoggerMixin):
    """Main WebSocket manager service"""
    
    def __init__(self):
        self.manager = ConnectionManager()
        self._startup_complete = False
        self._shutdown_complete = False

    async def startup(self):
        """Initialize the WebSocket manager"""
        self.logger.info("websocket_manager_starting")
        self._startup_complete = True
        self.logger.info("websocket_manager_started")

    async def shutdown(self):
        """Shutdown the WebSocket manager"""
        self.logger.info("websocket_manager_shutting_down")
        
        # Disconnect all clients
        for client_id in list(self.manager.active_connections.keys()):
            self.manager.disconnect(client_id)
        
        self._shutdown_complete = True
        self.logger.info("websocket_manager_shutdown_complete")

    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client"""
        await self.manager.connect(websocket, client_id)

    async def disconnect(self, client_id: str):
        """Disconnect a client"""
        self.manager.disconnect(client_id)

    async def send_message(self, client_id: str, message: Dict[str, Any]):
        """Send message to specific client"""
        await self.manager.send_message(client_id, message)

    async def broadcast_to_session(self, session_id: str, message: Dict[str, Any]):
        """Broadcast message to all clients in a session"""
        await self.manager.broadcast_to_session(session_id, message)

    async def initialize_session(self, client_id: str, session_id: str):
        """Initialize a new call session"""
        self.manager.client_sessions[client_id] = session_id
        
        if session_id not in self.manager.session_clients:
            self.manager.session_clients[session_id] = set()
        
        self.manager.session_clients[session_id].add(client_id)
        
        self.logger.info("session_initialized", client_id=client_id, session_id=session_id)

    async def finalize_session(self, client_id: str, session_id: str):
        """Finalize a call session"""
        if session_id in self.manager.session_clients:
            self.manager.session_clients[session_id].discard(client_id)
            if not self.manager.session_clients[session_id]:
                del self.manager.session_clients[session_id]
        
        if client_id in self.manager.client_sessions:
            del self.manager.client_sessions[client_id]
        
        self.logger.info("session_finalized", client_id=client_id, session_id=session_id)

    def is_healthy(self) -> bool:
        """Check if the WebSocket manager is healthy"""
        return (
            self._startup_complete and 
            not self._shutdown_complete and 
            self.manager._healthy
        )

    def get_stats(self) -> Dict[str, Any]:
        """Get WebSocket manager statistics"""
        return {
            "active_connections": self.manager.get_connection_count(),
            "active_sessions": len(self.manager.session_clients),
            "uptime": time.time() - min(self.manager.connection_times.values()) if self.manager.connection_times else 0,
            "healthy": self.is_healthy()
        } 