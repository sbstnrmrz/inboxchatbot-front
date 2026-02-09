'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Loader2, FileText } from 'lucide-react';
import { audioService } from '../services/audioService';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { TranscriptionButton } from './TranscriptionButton';

interface AudioPlayerProps {
  audioId: string;
  mimeType?: string;
  isAgentMessage?: boolean;
  transcript?: string;
}

export function AudioPlayer({ audioId, mimeType, isAgentMessage = false, transcript }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playbackRates = [1, 1.5, 2];

  // Fetch audio on mount
  useEffect(() => {
    let blobUrl: string | null = null;

    const fetchAudio = async () => {
      try {
        setIsLoading(true);
        setError(null);
        blobUrl = await audioService.getAudioBlobUrl(audioId);
        setAudioUrl(blobUrl);
      } catch (err) {
        console.error('Error loading audio:', err);
        setError('Error al cargar el audio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudio();

    // Cleanup: revoke blob URL when component unmounts
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [audioId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const currentIndex = playbackRates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % playbackRates.length;
    const newRate = playbackRates[nextIndex];
    
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
    setPlaybackRate(newRate);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Colors based on message direction
  const buttonBg = isAgentMessage ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600';
  const progressColor = isAgentMessage ? '#3b82f6' : '#10b981';
  const textColor = isAgentMessage ? 'text-gray-700' : 'text-gray-600';

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-1">
        <div className={`${buttonBg} text-white rounded-full p-2 flex items-center justify-center shrink-0`}>
          <Loader2 size={18} className="animate-spin" />
        </div>
        <span className={`text-xs ${textColor}`}>Cargando audio...</span>
      </div>
    );
  }

  // Show error state
  if (error || !audioUrl) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs text-red-500">{error || 'Error al cargar el audio'}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-1">
      <audio ref={audioRef} src={audioUrl} preload="metadata">
        <source src={audioUrl} type={mimeType || 'audio/ogg'} />
      </audio>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayPause}
        className={`${buttonBg} text-white rounded-full p-2 flex items-center justify-center transition-colors shrink-0`}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? <Pause size={18} fill="white" /> : <Play size={18} fill="white" />}
      </button>

      {/* Progress Bar and Time */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-1 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${progressColor} 0%, ${progressColor} ${(currentTime / duration) * 100}%, #d1d5db ${(currentTime / duration) * 100}%, #d1d5db 100%)`,
          }}
        />
        <div className={`text-xs ${textColor} flex justify-between`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Speed Button */}
      <button
        onClick={cyclePlaybackRate}
        className={`${textColor} text-xs font-medium px-2 py-1 rounded hover:bg-gray-200 transition-colors shrink-0`}
        aria-label="Cambiar velocidad de reproducción"
      >
        {playbackRate}x
      </button>

      {/* Transcript Popover Button */}
      {transcript && (
        <TranscriptionButton transcript={transcript}/>
      )}
    </div>
  );
}
