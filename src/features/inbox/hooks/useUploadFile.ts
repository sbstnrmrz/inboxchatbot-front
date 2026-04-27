import { useMutation } from "@tanstack/react-query"
import { env } from "@/lib/env"
import { ApiError } from "@/lib/api/client"

export interface UploadedFileResponse {
  url: string
  filename: string
  mimeType: string
  size: number
}

interface UploadFileInput {
  file: File
  conversationId: string
  caption?: string
}

async function uploadFile({ file, conversationId, caption }: UploadFileInput): Promise<UploadedFileResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("conversationId", conversationId)
  if (caption) formData.append("caption", caption)

  const response = await fetch(`${env.VITE_API_URL}/messages/send-media`, {
    method: "POST",
    credentials: "include",
    body: formData,
    // No Content-Type header — browser sets it with the correct boundary
  })

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText)
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<UploadedFileResponse>
}

export function useUploadFile() {
  return useMutation({
    mutationFn: uploadFile,
  })
}
