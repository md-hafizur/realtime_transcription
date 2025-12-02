'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TranscriptDisplayProps {
  partialText: string;
  finalText: string;
  wordCount: number;
  isRecording: boolean;
}

export function TranscriptDisplay({
  partialText,
  finalText,
  wordCount,
  isRecording,
}: TranscriptDisplayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Transcript</span>
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <span>Words: {wordCount}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[200px] p-4 bg-muted/30 rounded-md">
          {finalText && (
            <p className="text-foreground whitespace-pre-wrap">{finalText}</p>
          )}
          
          {partialText && (
            <p className="text-muted-foreground italic whitespace-pre-wrap mt-2">
              {partialText}
              {isRecording && (
                <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
              )}
            </p>
          )}

          {!finalText && !partialText && (
            <p className="text-center text-muted-foreground py-12">
              Start speaking to see transcription...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}