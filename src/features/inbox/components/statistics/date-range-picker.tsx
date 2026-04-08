import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function formatDate(date: Date) {
  return date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
}

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label =
    value?.from && value?.to
      ? `${formatDate(value.from)} — ${formatDate(value.to)}`
      : value?.from
        ? formatDate(value.from)
        : "Seleccionar rango"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-64 justify-start gap-2 font-normal", className)}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className={cn(!value?.from && "text-muted-foreground")}>{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range)
            if (range?.from && range?.to) setOpen(false)
          }}
          disabled={{ after: new Date() }}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
