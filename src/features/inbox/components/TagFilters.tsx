import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTags } from "@/features/inbox/hooks/useTags"

interface Props {
  value: string
  onValueChange: (value: string) => void
}

export function TagFilters({ value, onValueChange }: Props) {
  const { data: tags } = useTags()

  if (!tags || tags.length === 0) return null

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full max-w-48 cursor-pointer">
        <SelectValue placeholder="Todas las etiquetas" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="cursor-pointer">
          <SelectItem className="cursor-pointer" value="ALL">
            Todas las etiquetas
          </SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag._id} className="cursor-pointer" value={tag._id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
