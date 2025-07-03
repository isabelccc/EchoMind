'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Settings,
  Clock,
  User,
  MessageSquare
} from 'lucide-react';
import { AudioRecorder } from 'react-audio-voice-recorder';

interface CallInterfaceProps {
  isConnected: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onAudioChunk: (audioData: string) => void;
  sessionData: any;
}

export function CallInterface({
  isConnected,
  onStartCall,
  onEndCall,
  onAudioChunk,
  sessionData
}: CallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  
  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Call duration timer
  useEffect(() => {
    if (isCallActive && !durationRef.current) {
      startTimeRef.current = Date.now();
      durationRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }
      }, 1000);
    } else if (!isCallActive && durationRef.current) {
      clearInterval(durationRef.current);
      durationRef.current = null;
      setCallDuration(0);
    }

    return () => {
      if (durationRef.current) {
        clearInterval(durationRef.current);
      }
    };
  }, [isCallActive]);

  const handleStartCall = () => {
    setIsCallActive(true);
    onStartCall();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    onEndCall();
  };

  const handleAudioRecording = (blob: Blob) => {
    // Convert blob to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const audioData = base64data.split(',')[1]; // Remove data URL prefix
      onAudioChunk(audioData);
    };
    reader.readAsDataURL(blob);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Call Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {sessionData?.customer_id || 'Customer #12345'}
              </h2>
              <p className="text-sm text-gray-600">
                {isCallActive ? 'In Progress' : 'Ready to Start'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isCallActive && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(callDuration)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              ) : (
                <div className="w-2 h-2 bg-error-500 rounded-full"></div>
              )}
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted 
                ? 'bg-error-100 text-error-600 hover:bg-error-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`p-4 rounded-full transition-colors ${
              isSpeakerOn 
                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </button>

          {/* Start/End Call Button */}
          <button
            onClick={isCallActive ? handleEndCall : handleStartCall}
            disabled={!isConnected}
            className={`p-6 rounded-full transition-colors ${
              isCallActive
                ? 'bg-error-500 text-white hover:bg-error-600'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isCallActive ? <PhoneOff className="w-8 h-8" /> : <Phone className="w-8 h-8" />}
          </button>

          {/* Settings Button */}
          <button className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Call Status */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isCallActive 
              ? 'Call in progress - AI is analyzing conversation in real-time'
              : 'Click the phone button to start a call'
            }
          </p>
        </div>
      </div>

      {/* Audio Recording */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Audio Recording</h3>
          <div className="flex items-center space-x-2">
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="pulse-live w-2 h-2"></div>
                <span className="text-sm text-error-600 font-medium">Recording</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <AudioRecorder
            onRecordingComplete={handleAudioRecording}
            audioTrackConstraints={{
              noiseSuppression: true,
              echoCancellation: true,
            }}
            downloadOnSavePress={false}
            downloadFileExtension="webm"
            showVisualizer={true}
            classes={{
              AudioRecorderClass: 'w-full max-w-md',
              AudioRecorderStartSaveClass: 'btn btn-primary btn-lg',
              AudioRecorderPauseResumeClass: 'btn btn-secondary btn-lg',
              AudioRecorderDiscardClass: 'btn btn-outline btn-lg',
            }}
          />
        </div>
      </div>

      {/* Live Transcript */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Live Transcript</h3>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{transcripts.length} messages</span>
          </div>
        </div>
        
        <div className="h-64 overflow-y-auto custom-scrollbar space-y-3">
          {transcripts.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No transcript available yet</p>
              <p className="text-sm">Start a call to see real-time transcription</p>
            </div>
          ) : (
            transcripts.map((transcript, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-900">{transcript}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 