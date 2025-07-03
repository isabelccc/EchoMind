'use client';

import { useState, useEffect } from 'react';
import { CallInterface } from '@/components/call-interface';
import { InsightsPanel } from '@/components/insights-panel';
import { Header } from '@/components/header';
import { Sidebar } from '@/components/sidebar';
import { useWebSocket } from '@/hooks/use-websocket';
import { useCallSession } from '@/hooks/use-call-session';
import { toast } from 'react-hot-toast';

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const { connect, disconnect, sendMessage, lastMessage } = useWebSocket();
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
      const data = JSON.parse(lastMessage);
      
      if (data.type === 'insights') {
        toast.success('New insights generated!');
      }
    }
  }, [lastMessage]);

  const handleStartCall = async () => {
    if (!sessionId) return;
    
    try {
      await startSession(sessionId);
      
      // Send call start message
      sendMessage({
        type: 'call_start',
        session_id: sessionId,
        timestamp: Date.now()
      });
      
      toast.success('Call session started!');
    } catch (error) {
      toast.error('Failed to start call session');
    }
  };

  const handleEndCall = async () => {
    if (!sessionId) return;
    
    try {
      await endSession(sessionId);
      
      // Send call end message
      sendMessage({
        type: 'call_end',
        session_id: sessionId,
        timestamp: Date.now()
      });
      
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
      timestamp: Date.now()
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
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
              />
            </div>
            
            {/* Insights Panel */}
            <div className="w-96 border-l border-gray-200 bg-white">
              <InsightsPanel
                lastMessage={lastMessage}
                sessionId={sessionId}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 