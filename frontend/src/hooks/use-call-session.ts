import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface SessionData {
  session_id: string;
  status: string;
  created_at: number;
  agent_id?: string;
  customer_id?: string;
  call_type: string;
}

interface UseCallSessionReturn {
  sessionData: SessionData | null;
  startSession: (sessionId: string) => Promise<void>;
  endSession: (sessionId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  sessionStatus: 'idle' | 'starting' | 'active' | 'ending' | 'error';
}

export function useCallSession(): UseCallSessionReturn {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'idle' | 'starting' | 'active' | 'ending' | 'error'>('idle');

  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      setSessionStatus('starting');
      const response = await api.post('/sessions', {
        session_id: sessionId,
        call_type: 'support',
      });
      return response.data;
    },
    onSuccess: (data: SessionData) => {
      setSessionData(data);
      setSessionStatus('active');
      setError(null);
    },
    onError: (err: any) => {
      setSessionStatus('error');
      setError(err.message || 'Failed to start session');
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      setSessionStatus('ending');
      const response = await api.delete(`/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      setSessionData(null);
      setSessionStatus('idle');
      setError(null);
    },
    onError: (err: any) => {
      setSessionStatus('error');
      setError(err.message || 'Failed to end session');
    },
  });

  const startSession = useCallback(async (sessionId: string) => {
    try {
      await startSessionMutation.mutateAsync(sessionId);
    } catch (error) {
      // Error is handled in the mutation
    }
  }, [startSessionMutation]);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      await endSessionMutation.mutateAsync(sessionId);
    } catch (error) {
      // Error is handled in the mutation
    }
  }, [endSessionMutation]);

  return {
    sessionData,
    startSession,
    endSession,
    isLoading: startSessionMutation.isPending || endSessionMutation.isPending,
    error,
    sessionStatus,
  };
} 