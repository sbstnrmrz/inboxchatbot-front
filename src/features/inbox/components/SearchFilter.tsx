import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { SearchIcon } from "lucide-react"

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
      </InputGroup>
    </Field>
  )
}

