'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/types';
import { api } from '@/lib/api';
import { SessionList } from '@/components/SessionList';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);

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

  const handleDeleteInitiate = (id: string) => {
    setSessionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!sessionToDelete) return; // Should not happen

    try {
      await api.deleteSession(sessionToDelete);
      setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete));
      toast.success('Session successfully deleted.');
    } catch (err) {
      console.error('Failed to delete session:', err);
      toast.error('Failed to delete session.');
    } finally {
      setSessionToDelete(null); // Close dialog
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
        <SessionList sessions={sessions} onDelete={handleDeleteInitiate} />
      )}

      <AlertDialog open={!!sessionToDelete} onOpenChange={setSessionToDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              session and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}