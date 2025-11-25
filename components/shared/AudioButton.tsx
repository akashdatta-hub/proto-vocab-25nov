'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { playSound } from '@/lib/sound-effects';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AudioButtonProps {
  text: string;
  onPlay?: () => void;
  className?: string;
  variant?: 'default' | 'icon' | 'small';
  autoPlay?: boolean;
}

/**
 * AudioButton - Text-to-speech button with Google Cloud TTS
 *
 * Features:
 * - Plays text via TTS API
 * - Loading and playing states
 * - Multiple visual variants
 * - Auto-play support
 * - Error handling
 */
export function AudioButton({
  text,
  onPlay,
  className = '',
  variant = 'default',
  autoPlay = false
}: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const playAudio = async () => {
    if (isPlaying || isLoading) return;

    setIsLoading(true);
    setError(null);
    onPlay?.();

    try {
      // Call TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();

      // Create and play audio
      if (audioRef.current) {
        audioRef.current.pause();
      }

      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
        playSound('click', 0.2);
      };

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setError('Failed to play audio');
        setIsPlaying(false);
        setIsLoading(false);
        playSound('error', 0.3);
      };

      await audio.play();

    } catch (err) {
      console.error('TTS error:', err);
      setError(err instanceof Error ? err.message : 'Failed to play audio');
      setIsLoading(false);
      playSound('error', 0.3);
    }
  };

  // Auto-play on mount
  React.useEffect(() => {
    if (autoPlay) {
      playAudio();
    }
    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [autoPlay, text]);

  if (variant === 'icon') {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={playAudio}
        disabled={isLoading || isPlaying}
        className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center transition-all',
          isPlaying
            ? 'bg-amber-500 text-white'
            : 'bg-amber-100 hover:bg-amber-200 text-amber-700',
          (isLoading || isPlaying) && 'cursor-not-allowed opacity-70',
          className
        )}
        title={error || (isPlaying ? 'Playing...' : 'Play audio')}
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <Volume2 className="w-6 h-6 animate-pulse" />
        ) : (
          <Volume2 className="w-6 h-6" />
        )}
      </motion.button>
    );
  }

  if (variant === 'small') {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={playAudio}
        disabled={isLoading || isPlaying}
        className={cn(
          'flex items-center gap-2',
          className
        )}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isPlaying ? 'Playing...' : 'Listen'}
      </Button>
    );
  }

  return (
    <Button
      onClick={playAudio}
      disabled={isLoading || isPlaying}
      className={cn(
        'flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading...
        </>
      ) : isPlaying ? (
        <>
          <Volume2 className="w-5 h-5 animate-pulse" />
          Playing...
        </>
      ) : (
        <>
          <Volume2 className="w-5 h-5" />
          Hear the word
        </>
      )}
    </Button>
  );
}

/**
 * VolumeControl - Global volume control button
 */
interface VolumeControlProps {
  className?: string;
}

export function VolumeControl({ className = '' }: VolumeControlProps) {
  const [isMuted, setIsMuted] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('soundEnabled');
    setIsMuted(stored === 'false');
  }, []);

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem('soundEnabled', String(!newMuted));
    playSound('click', 0.2);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleMute}
      className={cn(
        'p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors',
        className
      )}
      title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5" />
      ) : (
        <Volume2 className="w-5 h-5" />
      )}
    </motion.button>
  );
}
