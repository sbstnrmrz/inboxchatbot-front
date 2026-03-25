import { useEffect, useRef, useState } from "react"
import { Loader2, Pause, Play } from "lucide-react"
import { getFileUrl } from "@/lib/api/files"
import type { MessageChannel } from "@/types/message.type"

interface AudioPlayerProps {
  channel: MessageChannel
  mediaId: string
}

// Decorative waveform bar heights (static, mimics WhatsApp style)
const WAVEFORM_BARS = [3, 5, 8, 6, 10, 12, 9, 7, 11, 8, 5, 7, 10, 13, 9, 6, 8, 5, 7, 9, 11, 8, 6, 10, 7, 5, 8, 6, 9, 4]

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00"
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function AudioPlayer({ channel, mediaId }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Fetch the audio as a blob so the session cookie is sent (cross-origin)
  useEffect(() => {
    let cancelled = false
    const url = getFileUrl(channel, "AUDIO", mediaId)

    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        const objectUrl = URL.createObjectURL(blob)
        blobUrlRef.current = objectUrl

        const audio = new Audio(objectUrl)
        audioRef.current = audio

        audio.addEventListener("loadedmetadata", () => {
          if (!cancelled) setDuration(audio.duration)
        })
        audio.addEventListener("timeupdate", () => {
          if (!cancelled) setCurrentTime(audio.currentTime)
        })
        audio.addEventListener("ended", () => {
          if (!cancelled) {
            setIsPlaying(false)
            setCurrentTime(0)
            audio.currentTime = 0
          }
        })
        audio.addEventListener("canplaythrough", () => {
          if (!cancelled) setIsLoading(false)
        })

        // In some browsers loadedmetadata fires before canplaythrough
        if (audio.readyState >= 3) setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [channel, mediaId])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio || isLoading || hasError) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current
    if (!audio) return
    const time = parseFloat(e.target.value)
    audio.currentTime = time
    setCurrentTime(time)
  }

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className="flex items-center gap-2 w-full min-w-[200px] max-w-[280px] py-1">
      {/* Play / Pause button */}
      <button
        onClick={togglePlay}
        disabled={isLoading || hasError}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-[#0d9488] text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#0f766e] transition-colors"
        aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4 fill-white" />
        ) : (
          <Play className="w-4 h-4 fill-white" />
        )}
      </button>

      {/* Waveform + scrubber */}
      <div className="flex flex-col flex-1 gap-1 min-w-0">
        {hasError ? (
          <span className="text-xs text-red-500">No se pudo cargar el audio</span>
        ) : (
          <>
            {/* Decorative waveform */}
            <div className="relative flex items-center gap-[2px] h-8">
              <svg
                viewBox={`0 0 ${WAVEFORM_BARS.length * 4} 16`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {WAVEFORM_BARS.map((height, i) => {
                  const x = i * 4 + 1
                  const barProgress = i / WAVEFORM_BARS.length
                  const played = barProgress <= progress
                  return (
                    <rect
                      key={i}
                      x={x}
                      y={(16 - height) / 2}
                      width={2}
                      height={height}
                      rx={1}
                      className={played ? "fill-[#0d9488] dark:fill-teal-400" : "fill-gray-300 dark:fill-gray-600"}
                    />
                  )
                })}
              </svg>

              {/* Invisible range input overlaid for seeking */}
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                disabled={isLoading || hasError || duration === 0}
                className="absolute inset-0 w-full opacity-0 cursor-pointer disabled:cursor-default"
                aria-label="Progreso del audio"
              />
            </div>

            {/* Timestamps */}
            <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 leading-none px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
