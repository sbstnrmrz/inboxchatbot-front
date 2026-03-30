import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon, XIcon } from "lucide-react"

interface SearchFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchFilter({ value, onChange, placeholder = "Buscar chats..." }: SearchFilterProps) {
  return (
    <Field className="w-full">
      <InputGroup>
        <InputGroupInput
          id="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <InputGroupAddon align="inline-start">
          <SearchIcon className="text-muted-foreground" />
        </InputGroupAddon>
        {value && (
          <InputGroupAddon align="inline-end">
            <button onClick={() => onChange("")} className="cursor-pointer text-muted-foreground hover:text-foreground">
              <XIcon className="size-4" />
            </button>
          </InputGroupAddon>
        )}
      </InputGroup>
    </Field>
  )
}

