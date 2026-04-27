import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ImageIcon, LoaderIcon, PlusIcon } from "lucide-react"
import { useRef } from "react"

interface FilesUploadDropdownProps {
  isUploading?: boolean
  onFileSelected: (file: File) => void
}

export const FilesUploadDropdown = ({ isUploading = false, onFileSelected }: FilesUploadDropdownProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    onFileSelected(file)
    e.target.value = ""
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PlusIcon className="cursor-pointer hover:bg-gray-200 rounded-full"/>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4}>
          <DropdownMenuItem
            className="cursor-pointer"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <LoaderIcon className="animate-spin"/>
            ) : (
              <ImageIcon/>
            )}
            Subir Imagen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
