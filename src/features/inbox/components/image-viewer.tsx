import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ImageOff, X } from "lucide-react"
import { getFileUrl } from "@/lib/api/files"
import type { MessageChannel } from "@/types/message.type"

interface ImageViewerProps {
  channel: MessageChannel
  mediaId: string
  caption?: string
  localBlobUrl?: string
  directUrl?: string
}

export function ImageViewer({ channel, mediaId, caption, localBlobUrl, directUrl }: ImageViewerProps) {
  const blobUrlRef = useRef<string | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(localBlobUrl ?? null)
  const [isLoading, setIsLoading] = useState(!localBlobUrl)
  const [hasError, setHasError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // If localBlobUrl arrives after mount (inbound fetch completed while retrying),
  // apply it immediately and cancel the ongoing server fetch via the dep below.
  useEffect(() => {
    if (!localBlobUrl) return
    setBlobUrl(localBlobUrl)
    setIsLoading(false)
    setHasError(false)
  }, [localBlobUrl])

  // Fetch image as blob so the session cookie is sent (cross-origin).
  // Retries with backoff because the backend may still be downloading the media
  // from WhatsApp/Instagram when the socket event arrives.
  // Skipped when a localBlobUrl is provided; re-evaluated if localBlobUrl arrives late.
  useEffect(() => {
    if (localBlobUrl) return
    let cancelled = false
    const url = directUrl ?? getFileUrl(channel, "IMAGE", mediaId)
    const MAX_RETRIES = 4
    const BASE_DELAY_MS = 1500

    async function attemptFetch(attempt: number): Promise<void> {
      if (cancelled) return
      try {
        const res = await fetch(url, { credentials: "include" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const blob = await res.blob()
        if (cancelled) return
        const objectUrl = URL.createObjectURL(blob)
        blobUrlRef.current = objectUrl
        setBlobUrl(objectUrl)
        setIsLoading(false)
      } catch {
        if (cancelled) return
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * 2 ** attempt
          await new Promise((resolve) => setTimeout(resolve, delay))
          return attemptFetch(attempt + 1)
        }
        setHasError(true)
        setIsLoading(false)
      }
    }

    attemptFetch(0)

    return () => {
      cancelled = true
      // Defer revocation so the browser has time to finish rendering the blob
      // before we free it. A microtask is enough — no visible delay.
      const urlToRevoke = blobUrlRef.current
      if (urlToRevoke) {
        blobUrlRef.current = null
        setBlobUrl(null)
        setTimeout(() => URL.revokeObjectURL(urlToRevoke), 0)
      }
    }
  }, [channel, mediaId, localBlobUrl, directUrl])

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightboxOpen])

  if (isLoading) {
    return (
      <div className="w-full h-40 rounded-lg bg-gray-200 animate-pulse" />
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center gap-1 w-full h-40 rounded-lg bg-gray-100 text-gray-400">
        <ImageOff className="w-6 h-6" />
        <span className="text-xs">No se pudo cargar la imagen</span>
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail inside the bubble */}
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setLightboxOpen(true)}
          className="block w-full rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0d9488] cursor-zoom-in"
          aria-label="Ver imagen completa"
        >
          <img
            src={blobUrl!}
            alt={caption ?? "Imagen"}
            className="w-full object-cover max-h-64 rounded-lg"
          />
        </button>

        {caption && (
          <p className="text-sm text-gray-700 wrap-break-word whitespace-pre-wrap px-0.5">
            {caption}
          </p>
        )}
      </div>

      {/* Lightbox portal */}
      {lightboxOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={() => setLightboxOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Vista de imagen completa"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image — stop propagation so clicking it doesn't close */}
            <div
              className="flex flex-col items-center gap-3 px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={blobUrl!}
                alt={caption ?? "Imagen"}
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
              />
              {caption && (
                <p className="text-sm text-white/90 text-center max-w-[60ch] wrap-break-word">
                  {caption}
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
