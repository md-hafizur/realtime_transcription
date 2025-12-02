import { AudioRecorder } from '@/components/AudioRecorder';

export default function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Real-Time Transcription</h1>
        <p className="text-muted-foreground">
          Start recording to transcribe your speech in real-time using Vosk AI
        </p>
      </div>

      <AudioRecorder />
    </div>
  );
}