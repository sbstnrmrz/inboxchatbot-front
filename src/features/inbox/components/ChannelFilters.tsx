import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"

type ChannelFilterValue = "WHATSAPP" | "INSTAGRAM" | "ALL";

interface Props {
  value: ChannelFilterValue;
  onValueChange: (value: ChannelFilterValue) => void;
}

export function ChannelFilters({ value, onValueChange }: Props) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full max-w-48 cursor-pointer">
        <SelectValue placeholder="Todos los canales" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup className="cursor-pointer">
          <SelectItem className="cursor-pointer" value="ALL">Todos</SelectItem>
          <SelectItem className="cursor-pointer" value={'WHATSAPP'}>
            <div className="flex items-center gap-2">
              <WhatsappIcon/>
              <span>WhatsApp</span>
            </div>
          </SelectItem>
          <SelectItem className="cursor-pointer" value={'INSTAGRAM'}>
            <div className="flex items-center gap-2">
              <InstagramIcon/>
              <span>Instagram</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

