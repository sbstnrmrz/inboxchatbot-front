import { env } from "@/lib/env"

const BASE_URL = env.VITE_API_URL

/**
 * Builds the URL for a stored media file.
 * @param channel   e.g. "WHATSAPP" | "INSTAGRAM"
 * @param messageType  e.g. "AUDIO" | "IMAGE"
 * @param mediaId   whatsappMediaId (or equivalent)
 */
export function getFileUrl(
  channel: string,
  messageType: string,
  mediaId: string,
): string {
  return `${BASE_URL}/files/${channel.toLowerCase()}/${messageType.toLowerCase()}/${mediaId}`
}
