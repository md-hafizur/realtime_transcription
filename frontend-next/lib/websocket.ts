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
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
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