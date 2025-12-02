'use client';

import React from 'react';
import Link from 'next/link';
import { Session } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

interface SessionListProps {
  sessions: Session[];
  onDelete?: (id: string) => void;
}

export function SessionList({ sessions, onDelete }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-muted-foreground">
            No transcription sessions yet. Start recording to create your first session!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card key={session.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <Link href={`/sessions/${session.id}`}>
                  <CardTitle className="text-lg hover:text-primary cursor-pointer">
                    Session from {formatRelativeTime(session.created_at)}
                  </CardTitle>
                </Link>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{session.word_count} words</span>
                  </span>
                  {session.duration_seconds && (
                    <span className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(session.duration_seconds)}</span>
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      session.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : session.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(session.id)}
                  className="text-destructive hover:text-destructive/90"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          {session.transcripts.length > 0 && (
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {session.transcripts[0].transcript_text || 'No transcript available'}
              </p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}