import { PlusIcon, TagsIcon } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Spinner } from "@/components/ui/spinner"
import { useTags } from "@/features/inbox/hooks/useTags"
import {
  useAddTagToConversation,
  useRemoveTagFromConversation,
} from "@/features/inbox/hooks/useConversationTags"

interface ConversationTagsDropdownProps {
  conversationId: string
  activeTags: string[]
}

export function ConversationTagsDropdown({
  conversationId,
  activeTags,
}: ConversationTagsDropdownProps) {
  const { data: tags, isLoading } = useTags()
  const addTag = useAddTagToConversation(conversationId)
  const removeTag = useRemoveTagFromConversation(conversationId)

  const handleToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      addTag.mutate(tagId, {
        onError: () => toast.error("Error al agregar la etiqueta"),
      })
    } else {
      removeTag.mutate(tagId, {
        onError: () => toast.error("Error al quitar la etiqueta"),
      })
    }
  }

  const isPending = addTag.isPending || removeTag.isPending

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="shrink-0 cursor-pointer rounded-full w-5 h-5 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-secondary-white"
          onClick={(e) => e.stopPropagation()}
        >
          {isPending ? (
            <Spinner className="w-3 h-3" />
          ) : (
            <PlusIcon className="w-full h-full" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="flex items-center gap-1.5 text-xs">
          <TagsIcon className="w-3.5 h-3.5" />
          Etiquetas
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="flex justify-center py-2">
            <Spinner className="w-4 h-4" />
          </div>
        ) : tags && tags.length > 0 ? (
          tags.map((tag) => (
            <DropdownMenuCheckboxItem
              key={tag._id}
              checked={activeTags.includes(tag._id)}
              onCheckedChange={(checked) => handleToggle(tag._id, checked)}
              onSelect={(e) => e.preventDefault()}
            >
              <div className="flex items-center gap-2 cursor-pointer">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-sm">{tag.name}</span>
              </div>
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 px-2 py-1.5">No hay etiquetas</p>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
