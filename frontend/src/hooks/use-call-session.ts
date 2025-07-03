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
}

export function useCallSession(): UseCallSessionReturn {
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post('/sessions', {
        session_id: sessionId,
        call_type: 'support',
      });
      return response.data;
    },
    onSuccess: (data: SessionData) => {
      setSessionData(data);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to start session');
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/sessions/${sessionId}`);
      return response.data;
    },
    onSuccess: () => {
      setSessionData(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to end session');
    },
  });

  const startSession = useCallback(async (sessionId: string) => {
    await startSessionMutation.mutateAsync(sessionId);
  }, [startSessionMutation]);

  const endSession = useCallback(async (sessionId: string) => {
    await endSessionMutation.mutateAsync(sessionId);
  }, [endSessionMutation]);

  return {
    sessionData,
    startSession,
    endSession,
    isLoading: startSessionMutation.isPending || endSessionMutation.isPending,
    error,
  };
} 