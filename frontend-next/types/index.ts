// Session types
export interface Session {
  id: string;
  created_at: string;
  updated_at?: string;
  duration_seconds?: number;
  word_count: number;
  status: 'in_progress' | 'completed' | 'failed';
  metadata: Record<string, any>;
  transcripts: Transcript[];
}

export interface Transcript {
  id: string;
  session_id: string;
  transcript_text: string;
  confidence?: number;
  created_at: string;
}

export interface SessionListResponse {
  total: number;
  sessions: Session[];
}

// WebSocket message types
export interface WSMessage {
  type: string;
}

export interface WSStartMessage extends WSMessage {
  type: 'start';
  session_id?: string;
}

export interface WSAudioMessage extends WSMessage {
  type: 'audio';
  data: string; // base64
}

export interface WSStopMessage extends WSMessage {
  type: 'stop';
}

export interface WSPartialResult extends WSMessage {
  type: 'partial';
  text: string;
}

export interface WSFinalChunk extends WSMessage {
  type: 'final_chunk';
  text: string;
  confidence?: number;
}

export interface WSFinalResult extends WSMessage {
  type: 'final';
  text: string;
  word_count: number;
  duration: number;
  confidence?: number;
}

export interface WSSessionStarted extends WSMessage {
  type: 'session_started';
  session_id: string;
}

export interface WSError extends WSMessage {
  type: 'error';
  message: string;
}

// Audio recording state
export interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error?: string;
}

// Transcription state
export interface TranscriptionState {
  sessionId?: string;
  partialText: string;
  finalText: string;
  wordCount: number;
  isConnected: boolean;
  error?: string;
}