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
  MessageSquare,
  Zap,
  Activity,
  TrendingUp,
  Shield,
  Sparkles
} from 'lucide-react';

interface CallInterfaceProps {
  isConnected: boolean;
  onStartCall: () => void;
  onEndCall: () => void;
  onAudioChunk: (audioData: string) => void;
  sessionData: any;
  transcripts?: string[];
  aiStatus?: 'idle' | 'analyzing' | 'processing';
}

export function CallInterface({
  isConnected,
  onStartCall,
  onEndCall,
  onAudioChunk,
  sessionData,
  transcripts = [],
  aiStatus = 'idle'
}: CallInterfaceProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [lastAudioChunk, setLastAudioChunk] = useState<string | null>(null);
  
  const durationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Start audio recording when call starts
  useEffect(() => {
    if (isCallActive && !isRecording) {
      startAudioRecording();
    } else if (!isCallActive && isRecording) {
      stopAudioRecording();
    }
  }, [isCallActive]);

  const startAudioRecording = async () => {
    try {
      console.log('Starting audio recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Check for supported MIME types in order of preference
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus'
      ];
      
      let mimeType = null;
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          console.log('Using MIME type:', mimeType);
          break;
        }
      }
      
      if (!mimeType) {
        throw new Error('No supported audio MIME type found');
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000 // 128 kbps for good quality
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log('Audio chunk received:', event.data.size, 'bytes, type:', event.data.type);
          
          // Convert to base64 and send
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            const audioData = base64data.split(',')[1];
            setLastAudioChunk(audioData); // Store for debugging
            onAudioChunk(audioData);
          };
          reader.readAsDataURL(event.data);
        }
      };
      
      mediaRecorder.start(1000); // Send audio chunks every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      console.log('Audio recording started successfully with MIME type:', mimeType);
    } catch (error) {
      console.error('Failed to start audio recording:', error);
      alert('Failed to start audio recording. Please check microphone permissions.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);
  };

  const handleStartCall = () => {
    setIsCallActive(true);
    onStartCall();
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    onEndCall();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAiStatusColor = () => {
    switch (aiStatus) {
      case 'analyzing': return 'text-blue-500';
      case 'processing': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };

  const getAiStatusText = () => {
    switch (aiStatus) {
      case 'analyzing': return 'Analyzing conversation...';
      case 'processing': return 'Generating insights...';
      default: return 'AI Ready';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Card */}
      <div className="card shadow-medium animate-fade-in">
        <div className="card-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-medium">
                  <User className="w-8 h-8 text-white" />
                </div>
                {isCallActive && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sessionData?.customer_id || 'Customer #12345'}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`flex items-center space-x-1 text-sm ${getAiStatusColor()}`}>
                    <Sparkles className="w-4 h-4" />
                    <span>{getAiStatusText()}</span>
                  </div>
                  {isCallActive && (
                    <>
                      <span className="text-gray-400">•</span>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono">{formatDuration(callDuration)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`status-indicator w-3 h-3 ${isConnected ? 'text-green-500' : 'text-red-500'}`}></div>
                <span className="text-sm font-medium text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call Controls */}
      <div className="card shadow-medium animate-slide-up">
        <div className="card-content">
          <div className="flex items-center justify-center space-x-6">
            {/* Mute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                isMuted 
                  ? 'bg-red-100 text-red-600 shadow-soft' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {/* Speaker Button */}
            <button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`p-4 rounded-2xl transition-all duration-200 transform hover:scale-105 ${
                isSpeakerOn 
                  ? 'bg-blue-100 text-blue-600 shadow-soft' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {/* Start/End Call Button */}
            <button
              onClick={isCallActive ? handleEndCall : handleStartCall}
              disabled={!isConnected}
              className={`p-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-strong ${
                isCallActive
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                  : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {isCallActive ? <PhoneOff className="w-10 h-10" /> : <Phone className="w-10 h-10" />}
            </button>

            {/* Settings Button */}
            <button className="p-4 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200 transform hover:scale-105">
              <Settings className="w-6 h-6" />
            </button>

            {/* Debug Audio Button */}
            {isRecording && lastAudioChunk && (
              <button
                onClick={async () => {
                  // Test the backend decoding with the last real audio chunk
                  fetch('http://localhost:8000/api/debug/audio/test', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audio_data: lastAudioChunk })
                  })
                  .then(response => response.json())
                  .then(result => {
                    console.log('Audio test result:', result);
                    if (result.success) {
                      alert(`Audio test successful! Decoded ${result.samples} samples.`);
                    } else {
                      alert(`Audio test failed: ${result.error}`);
                    }
                  })
                  .catch(error => {
                    console.error('Audio test error:', error);
                    alert('Audio test failed: ' + error.message);
                  });
                }}
                className="p-4 rounded-2xl bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-all duration-200 transform hover:scale-105"
                title="Test Last Audio Chunk"
              >
                <Activity className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Call Status */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isCallActive 
                ? 'AI is actively analyzing your conversation in real-time'
                : 'Click the green button to start your call with AI insights'
              }
            </p>
          </div>
        </div>
      </div>

      {/* AI Insights Preview */}
      <div className="card shadow-medium animate-scale-in">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title flex items-center space-x-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              <span>AI Insights</span>
            </h3>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">Real-time</span>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Sentiment</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">Positive</p>
              <p className="text-sm text-blue-600">85% confidence</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">PII Detected</span>
              </div>
              <p className="text-2xl font-bold text-green-700">2 Items</p>
              <p className="text-sm text-green-600">Email, Phone</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Topics</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">3 Found</p>
              <p className="text-sm text-purple-600">Support, Billing, Features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Transcript */}
      <div className="card shadow-medium flex-1 animate-fade-in">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="card-title flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-blue-500" />
              <span>Live Transcript</span>
            </h3>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span>Live</span>
              </div>
              <span className="text-sm text-gray-500">{transcripts.length} messages</span>
            </div>
          </div>
        </div>
        <div className="card-content">
          <div className="h-64 overflow-y-auto custom-scrollbar space-y-3">
            {transcripts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No transcript available</p>
                <p className="text-sm">Start a call to see real-time transcription and AI insights</p>
              </div>
            ) : (
              transcripts.map((transcript, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200 animate-slide-up">
                  <p className="text-sm text-gray-900 leading-relaxed">{transcript}</p>
                  <p className="text-xs text-gray-500 mt-2 font-mono">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 