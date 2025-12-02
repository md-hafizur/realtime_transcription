import {
  WSMessage,
  WSStartMessage,
  WSAudioMessage,
  WSStopMessage,
  WSPartialResult,
  WSFinalResult,
  WSSessionStarted,
  WSError,
} from '@/types';
import { toast } from 'sonner'; // Import toast

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export type WSMessageHandler = (message: WSMessage) => void;

export class TranscriptionWebSocket {
  private ws: WebSocket | null = null;
  private messageHandler: WSMessageHandler | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;

  constructor() {}

  connect(onMessage: WSMessageHandler): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.messageHandler = onMessage;
        this.ws = new WebSocket(`${WS_URL}/ws/transcribe`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          toast.success('WebSocket connected for transcription.');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (this.messageHandler) {
              this.messageHandler(data);
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
            toast.error('Received malformed message from server.');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('WebSocket connection failed. Please try again.');
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          toast.info('WebSocket disconnected.');
        };
      } catch (error) {
        toast.error('Failed to establish WebSocket connection.');
        reject(error);
      }
    });
  }

  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      toast.error('WebSocket is not connected. Cannot send message.');
      throw new Error('WebSocket is not connected');
    }
  }

  startSession(): void {
    const message: WSStartMessage = { type: 'start' };
    this.send(message);
  }

  sendAudio(audioData: string): void {
    const message: WSAudioMessage = { type: 'audio', data: audioData };
    this.send(message);
  }

  stopSession(): void {
    const message: WSStopMessage = { type: 'stop' };
    this.send(message);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.messageHandler = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}