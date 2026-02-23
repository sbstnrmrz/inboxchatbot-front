import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ImageOff, Loader2, X } from "lucide-react"
import { getFileUrl } from "@/lib/api/files"
import type { MessageChannel } from "@/types/message.type"

interface ImageViewerProps {
  channel: MessageChannel
  mediaId: string
  caption?: string
}

export function ImageViewer({ channel, mediaId, caption }: ImageViewerProps) {
  const blobUrlRef = useRef<string | null>(null)

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Fetch image as blob so the session cookie is sent (cross-origin)
  useEffect(() => {
    let cancelled = false
    const url = getFileUrl(channel, "IMAGE", mediaId)

    fetch(url, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (cancelled) return
        const objectUrl = URL.createObjectURL(blob)
        blobUrlRef.current = objectUrl
        setBlobUrl(objectUrl)
        setIsLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setHasError(true)
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
      }
    }
  }, [channel, mediaId])

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
