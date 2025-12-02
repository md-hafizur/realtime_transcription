'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/types';
import { api } from '@/lib/api';
import { SessionList } from '@/components/SessionList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getSessions();
      setSessions(response.sessions);
    } catch (err) {
      setError('Failed to load sessions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      await api.deleteSession(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error('Failed to delete session:', err);
      alert('Failed to delete session');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transcription History</h1>
          <p className="text-muted-foreground">
            View and manage your past transcription sessions
          </p>
        </div>
        <Button onClick={fetchSessions} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {loading && (
        <p className="text-center text-muted-foreground py-12">
          Loading sessions...
        </p>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <SessionList sessions={sessions} onDelete={handleDelete} />
      )}
    </div>
  );
}