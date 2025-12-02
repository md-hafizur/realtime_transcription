'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Session } from '@/types';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, FileText, Trash2 } from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchSession(params.id as string);
    }
  }, [params.id]);

  const fetchSession = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSession(id);
      setSession(data);
    } catch (err) {
      setError('Failed to load session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!session || !confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await api.deleteSession(session.id);
      router.push('/sessions');
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading session...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">
            {error || 'Session not found'}
          </p>
        </div>
      </div>
    );
  }

  const transcript = session.transcripts[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(session.created_at)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">
                  {formatDuration(session.duration_seconds)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Word Count</p>
                <p className="font-medium">{session.word_count}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          {transcript ? (
            <div className="space-y-2">
              <div className="p-4 bg-muted/30 rounded-md min-h-[200px]">
                <p className="whitespace-pre-wrap">
                  {transcript.transcript_text || 'No transcript available'}
                </p>
              </div>
              {transcript.confidence && (
                <p className="text-sm text-muted-foreground">
                  Confidence: {(transcript.confidence * 100).toFixed(1)}%
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No transcript available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}