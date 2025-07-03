"use client";

import { useState, useEffect } from 'react';
import { CallInterface } from '@/components/call-interface';
import { InsightsPanel } from '@/components/insights-panel';
import { useWebSocket } from '@/hooks/use-websocket';
import { useCallSession } from '@/hooks/use-call-session';
import { toast } from 'react-hot-toast';

export default function CallsPage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [aiStatus, setAiStatus] = useState<'idle' | 'analyzing' | 'processing'>('idle');

  const { isConnected, connect, disconnect, sendMessage, lastMessage } = useWebSocket();
  const { startSession, endSession, sessionData } = useCallSession();

  useEffect(() => {
    // Auto-generate session ID for demo
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);

    // Connect to WebSocket
    const clientId = `client_${Date.now()}`;
    connect(clientId);

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    if (lastMessage) {
      console.log('[DEBUG] Incoming WebSocket message:', lastMessage);
      try {
        const data = JSON.parse(lastMessage);
        
        switch (data.type) {
          case 'insights':
            toast.success('New insights generated!');
            break;
          case 'transcript':
            setTranscripts(prev => [...prev, data.text]);
            break;
          case 'ai_status':
            setAiStatus(data.status);
            break;
          case 'error':
            toast.error(data.message || 'An error occurred');
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    }
  }, [lastMessage]);

  const handleStartCall = async () => {
    if (!sessionId) return;
    try {
      await startSession(sessionId);
      sendMessage({
        type: 'call_start',
        session_id: sessionId,
        timestamp: Date.now(),
      });
      setAiStatus('analyzing');
      toast.success('Call session started!');
    } catch (error) {
      toast.error('Failed to start call session');
    }
  };

  const handleEndCall = async () => {
    if (!sessionId) return;
    try {
      await endSession(sessionId);
      sendMessage({
        type: 'call_end',
        session_id: sessionId,
        timestamp: Date.now(),
      });
      setAiStatus('idle');
      toast.success('Call session ended!');
    } catch (error) {
      toast.error('Failed to end call session');
    }
  };

  const handleAudioChunk = (audioData: string) => {
    if (!sessionId) return;
    sendMessage({
      type: 'audio_chunk',
      audio: audioData,
      session_id: sessionId,
      timestamp: Date.now(),
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex">
            {/* Call Interface */}
            <div className="flex-1 p-6">
              <CallInterface
                isConnected={isConnected}
                onStartCall={handleStartCall}
                onEndCall={handleEndCall}
                onAudioChunk={handleAudioChunk}
                sessionData={sessionData}
                transcripts={transcripts}
                aiStatus={aiStatus}
              />
            </div>
            {/* Insights Panel */}
            <div className="w-96 border-l border-gray-200 bg-white">
              <InsightsPanel lastMessage={lastMessage} sessionId={sessionId} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 