import asyncio
import base64
import io
import time
from typing import Dict, Optional, List, Any
import openai
import numpy as np
from pydub import AudioSegment
import soundfile as sf
from app.core.logging import LoggerMixin, log_performance
from app.core.config import settings

class AudioProcessor(LoggerMixin):
    """Handles real-time audio processing and speech-to-text conversion"""
    
    def __init__(self):
        self.openai_client = None
        self.session_buffers: Dict[str, List[bytes]] = {}
        self.session_contexts: Dict[str, List[str]] = {}
        self._startup_complete = False
        self._shutdown_complete = False
        
        # Audio processing settings
        self.chunk_size = settings.AUDIO_CHUNK_SIZE
        self.sample_rate = settings.AUDIO_SAMPLE_RATE
        self.channels = settings.AUDIO_CHANNELS

    async def startup(self):
        """Initialize the audio processor"""
        self.logger.info("audio_processor_starting")
        
        # Initialize OpenAI client
        if settings.OPENAI_API_KEY:
            self.openai_client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            self.logger.info("openai_client_initialized")
        else:
            self.logger.warning("openai_api_key_not_set")
        
        self._startup_complete = True
        self.logger.info("audio_processor_started")

    async def shutdown(self):
        """Shutdown the audio processor"""
        self.logger.info("audio_processor_shutting_down")
        
        # Clear session data
        self.session_buffers.clear()
        self.session_contexts.clear()
        
        self._shutdown_complete = True
        self.logger.info("audio_processor_shutdown_complete")

    def is_healthy(self) -> bool:
        """Check if the audio processor is healthy"""
        return (
            self._startup_complete and 
            not self._shutdown_complete and 
            self.openai_client is not None
        )

    async def process_audio_chunk(self, audio_data: str, session_id: str) -> Optional[str]:
        """Process an audio chunk and return transcript"""
        start_time = time.time()
        
        try:
            # Decode base64 audio data
            audio_bytes = base64.b64decode(audio_data)
            
            # Add to session buffer
            if session_id not in self.session_buffers:
                self.session_buffers[session_id] = []
            
            self.session_buffers[session_id].append(audio_bytes)
            
            # Check if we have enough audio for processing
            if len(self.session_buffers[session_id]) >= 3:  # Process every 3 chunks
                transcript = await self._transcribe_session_audio(session_id)
                
                # Log performance
                duration = time.time() - start_time
                log_performance("audio_processing", duration, session_id=session_id)
                
                return transcript
            
            return None
            
        except Exception as e:
            self.logger.error("audio_processing_error", session_id=session_id, error=str(e))
            return None

    async def _transcribe_session_audio(self, session_id: str) -> Optional[str]:
        """Transcribe accumulated audio for a session"""
        try:
            # Combine audio chunks
            combined_audio = b''.join(self.session_buffers[session_id])
            
            # Convert to proper format for Whisper
            audio_file = await self._prepare_audio_for_whisper(combined_audio)
            
            if not audio_file:
                return None
            
            # Call Whisper API
            transcript = await self._call_whisper_api(audio_file)
            
            # Clear buffer after successful transcription
            self.session_buffers[session_id] = []
            
            # Store in context
            if transcript:
                if session_id not in self.session_contexts:
                    self.session_contexts[session_id] = []
                self.session_contexts[session_id].append(transcript)
                
                # Keep only last 10 transcripts for context
                if len(self.session_contexts[session_id]) > 10:
                    self.session_contexts[session_id] = self.session_contexts[session_id][-10:]
            
            return transcript
            
        except Exception as e:
            self.logger.error("transcription_error", session_id=session_id, error=str(e))
            return None

    async def _prepare_audio_for_whisper(self, audio_bytes: bytes) -> Optional[io.BytesIO]:
        """Prepare audio data for Whisper API"""
        try:
            # Load audio using pydub
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
            
            # Convert to mono if needed
            if audio.channels > 1:
                audio = audio.set_channels(1)
            
            # Resample to 16kHz if needed
            if audio.frame_rate != 16000:
                audio = audio.set_frame_rate(16000)
            
            # Export as WAV
            output = io.BytesIO()
            audio.export(output, format="wav")
            output.seek(0)
            
            return output
            
        except Exception as e:
            self.logger.error("audio_preparation_error", error=str(e))
            return None

    async def _call_whisper_api(self, audio_file: io.BytesIO) -> Optional[str]:
        """Call OpenAI Whisper API"""
        if not self.openai_client:
            self.logger.error("openai_client_not_initialized")
            return None
        
        try:
            response = await self.openai_client.audio.transcriptions.create(
                model=settings.WHISPER_MODEL,
                file=audio_file,
                response_format="text"
            )
            
            return response.strip() if response else None
            
        except Exception as e:
            self.logger.error("whisper_api_error", error=str(e))
            return None

    def get_session_context(self, session_id: str) -> List[str]:
        """Get conversation context for a session"""
        return self.session_contexts.get(session_id, [])

    def clear_session(self, session_id: str):
        """Clear session data"""
        if session_id in self.session_buffers:
            del self.session_buffers[session_id]
        if session_id in self.session_contexts:
            del self.session_contexts[session_id]
        
        self.logger.info("session_cleared", session_id=session_id)

    def get_stats(self) -> Dict[str, Any]:
        """Get audio processor statistics"""
        return {
            "active_sessions": len(self.session_buffers),
            "total_contexts": sum(len(contexts) for contexts in self.session_contexts.values()),
            "healthy": self.is_healthy(),
            "openai_configured": self.openai_client is not None
        }

class AudioChunkProcessor:
    """Helper class for processing individual audio chunks"""
    
    @staticmethod
    def validate_audio_chunk(audio_data: str) -> bool:
        """Validate audio chunk format"""
        try:
            # Check if it's valid base64
            base64.b64decode(audio_data)
            return True
        except Exception:
            return False
    
    @staticmethod
    def get_audio_duration(audio_bytes: bytes) -> float:
        """Get duration of audio in seconds"""
        try:
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
            return len(audio) / 1000.0  # Convert milliseconds to seconds
        except Exception:
            return 0.0 