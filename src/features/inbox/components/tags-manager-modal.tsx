import { useState } from "react"
import { PencilIcon, TagsIcon, TrashIcon, XIcon, CheckIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useTags } from "@/features/inbox/hooks/useTags"
import { useCreateTag } from "@/features/inbox/hooks/useCreateTag"
import { useUpdateTag } from "@/features/inbox/hooks/useUpdateTag"
import { useDeleteTag } from "@/features/inbox/hooks/useDeleteTag"
import type { Tag } from "@/types/tag.type"

const PRESET_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#6B7280", // gray
  "#1F2937", // dark
]

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (color: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PRESET_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
          style={{
            backgroundColor: color,
            borderColor: value === color ? "rgba(0,0,0,0.4)" : "transparent",
          }}
          onClick={() => onChange(color)}
        />
      ))}
    </div>
  )
}

function TagRow({ tag }: { tag: Tag }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)

  const updateTag = useUpdateTag()
  const deleteTag = useDeleteTag()

  const handleSave = () => {
    if (!name.trim()) return
    updateTag.mutate(
      { id: tag._id, data: { name: name.trim(), color } },
      {
        onSuccess: () => {
          toast.success("Etiqueta actualizada")
          setEditing(false)
        },
        onError: () => toast.error("Error al actualizar la etiqueta"),
      },
    )
  }

  const handleDelete = () => {
    deleteTag.mutate(tag._id, {
      onSuccess: () => toast.success("Etiqueta eliminada"),
      onError: () => toast.error("Error al eliminar la etiqueta"),
    })
  }

  const handleCancel = () => {
    setName(tag.name)
    setColor(tag.color)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex flex-col gap-2 p-2 rounded-lg border border-secondary-white bg-primary-white">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave()
              if (e.key === "Escape") handleCancel()
            }}
          />
          <button
            type="button"
            className="p-1 rounded hover:bg-white text-green-600"
            disabled={updateTag.isPending || !name.trim()}
            onClick={handleSave}
          >
            {updateTag.isPending ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            className="p-1 rounded hover:bg-white text-gray-500"
            onClick={handleCancel}
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <ColorPicker value={color} onChange={setColor} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-primary-white group">
      <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
      <span className="flex-1 text-sm">{tag.name}</span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 rounded hover:bg-white text-gray-500"
          onClick={() => setEditing(true)}
        >
          <PencilIcon className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-white text-red-500"
          disabled={deleteTag.isPending}
          onClick={handleDelete}
        >
          {deleteTag.isPending ? <Spinner className="w-3.5 h-3.5" /> : <TrashIcon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

function CreateTagForm() {
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[8])
  const createTag = useCreateTag()

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name.trim()) return
    createTag.mutate(
      { name: name.trim(), color },
      {
        onSuccess: () => {
          toast.success("Etiqueta creada")
          setName("")
          setColor(PRESET_COLORS[8])
        },
        onError: () => toast.error("Error al crear la etiqueta"),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-3 border-t border-secondary-white">
      <span className="text-sm font-medium text-gray-700">Nueva etiqueta</span>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <Input
          placeholder="Nombre de la etiqueta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-8 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={!name.trim() || createTag.isPending}
          className="shrink-0"
        >
          {createTag.isPending ? <Spinner className="w-4 h-4" /> : <PlusIcon className="w-4 h-4" />}
        </Button>
      </div>
      <ColorPicker value={color} onChange={setColor} />
    </form>
  )
}

export function TagsManagerModal() {
  const [open, setOpen] = useState(false)
  const { data: tags, isLoading } = useTags()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="p-1 cursor-pointer rounded hover:bg-secondary-white text-gray-500"
          title="Gestionar etiquetas"
        >
          <TagsIcon className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gestionar etiquetas</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 min-h-[60px]">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner className="w-5 h-5" />
            </div>
          ) : tags && tags.length > 0 ? (
            tags.map((tag) => <TagRow key={tag._id} tag={tag} />)
          ) : (
            <p className="text-sm text-gray-400 py-2 text-center">
              No hay etiquetas. Crea una a continuación.
            </p>
          )}
        </div>

        <CreateTagForm />
      </DialogContent>
    </Dialog>
  )
}
