import { useState, useCallback, useRef } from 'react';
import { TranscriptionWebSocket } from '@/lib/websocket';
import { WSMessage } from '@/types';

interface UseTranscriptionReturn {
  sessionId: string | null;
  partialText: string;
  finalText: string;
  wordCount: number;
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendAudio: (audioData: Float32Array) => void;
  startSession: () => void;
  stopSession: () => void;
}

export function useTranscription(): UseTranscriptionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [partialText, setPartialText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<TranscriptionWebSocket | null>(null);

  const handleMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'session_started':
        setSessionId((message as any).session_id);
        break;

      case 'partial':
        setPartialText((message as any).text);
        break;

      case 'final_chunk':
        const chunkText = (message as any).text;
        if (chunkText) {
          setFinalText((prev) => (prev ? `${prev} ${chunkText}` : chunkText));
        }
        setPartialText('');
        break;

      case 'final':
        setFinalText((message as any).text);
        setWordCount((message as any).word_count);
        setPartialText('');
        break;

      case 'error':
        setError((message as any).message);
        break;
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const ws = new TranscriptionWebSocket();
      await ws.connect(handleMessage);
      wsRef.current = ws;
      setIsConnected(true);
    } catch (err) {
      setError('Failed to connect to transcription service');
      console.error(err);
    }
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }
    setIsConnected(false);
    setSessionId(null);
    setPartialText('');
  }, []);

  const startSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.startSession();
      setFinalText('');
      setPartialText('');
      setWordCount(0);
    }
  }, []);

  const stopSession = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.stopSession();
    }
  }, []);

  const sendAudio = useCallback((audioData: Float32Array) => {
    if (wsRef.current && wsRef.current.isConnected()) {
      // Convert Float32Array to PCM Int16
      const pcmData = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        const s = Math.max(-1, Math.min(1, audioData[i]));
        pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Convert to base64
      const uint8Array = new Uint8Array(pcmData.buffer);
      const base64 = btoa(String.fromCharCode(...uint8Array));

      wsRef.current.sendAudio(base64);
    }
  }, []);

  return {
    sessionId,
    partialText,
    finalText,
    wordCount,
    isConnected,
    error,
    connect,
    disconnect,
    sendAudio,
    startSession,
    stopSession,
  };
}
