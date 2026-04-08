import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DateRangePicker } from "./date-range-picker"
import { useMessageCountByRange } from "@/features/inbox/hooks/useMessageStats"

const chartConfig = {
  count: {
    label: "Mensajes",
    color: "var(--primary)",
  },
} satisfies ChartConfig

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from, to }
}

function formatDate(dateStr: string) {
  const [, month, day] = dateStr.split("-")
  return `${day}/${month}`
}

export function MessagesChart() {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const { data, isLoading } = useMessageCountByRange(
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Mensajes por día</CardTitle>
          <CardDescription>Total de mensajes recibidos por día</CardDescription>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground text-sm">
            Cargando...
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={Math.max(0, Math.floor(chartData.length / 10) - 1)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillCount)"
                stroke="var(--primary)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
