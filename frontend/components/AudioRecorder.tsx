'use client';

import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useTranscription } from '@/hooks/useTranscription';
import { formatDuration } from '@/lib/utils';
import { TranscriptDisplay } from './TranscriptDisplay';

export function AudioRecorder() {
  const {
    sessionId,
    partialText,
    finalText,
    wordCount,
    isConnected,
    error: transcriptionError,
    connect,
    disconnect,
    sendAudio,
    startSession,
    stopSession,
  } = useTranscription();

  const {
    isRecording,
    duration,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useAudioRecorder(sendAudio);

  const handleStartRecording = async () => {
    try {
      // Connect to WebSocket
      if (!isConnected) {
        await connect();
      }

      // Start transcription session
      startSession();

      // Start audio recording
      await startRecording();
      toast.success('Audio transcription started.');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleStopRecording = () => {
    // Stop recording
    stopRecording();
    toast.info('Audio transcription stopped.');
    // Stop transcription session
    stopSession();

    // Disconnect after a delay to receive final result
    setTimeout(() => {
      disconnect();
    }, 2000);
  };

  const error = transcriptionError || recordingError;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Real-Time Transcription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            {!isRecording ? (
              <Button
                size="lg"
                onClick={handleStartRecording}
                className="w-32 h-32 rounded-full"
                disabled={isConnected && isRecording}
              >
                {isConnected && !isRecording ? (
                  <Loader2 className="w-12 h-12 animate-spin" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                variant="destructive"
                onClick={handleStopRecording}
                className="w-32 h-32 rounded-full"
              >
                <Square className="w-12 h-12" />
              </Button>
            )}

            <div className="text-center">
              <p className="text-2xl font-bold font-mono">
                {formatDuration(duration)}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRecording ? 'Recording...' : 'Click to start recording'}
              </p>
            </div>

            {sessionId && (
              <p className="text-xs text-muted-foreground">
                Session: {sessionId}
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Connection Status */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            <span className="text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {(isRecording || finalText) && (
        <TranscriptDisplay
          partialText={partialText}
          finalText={finalText}
          wordCount={wordCount}
          isRecording={isRecording}
        />
      )}
    </div>
  );
}