import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DateRangePicker } from "./date-range-picker"
import { useLlmUsageByRange } from "@/features/inbox/hooks/useLlmUsage"

const chartConfig = {
  openai: {
    label: "OpenAI",
    color: "var(--chart-1)",
  },
  gemini: {
    label: "Gemini",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from, to }
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year.slice(2)}`
}

export function LlmUsageChart() {
  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const { data, isLoading } = useLlmUsageByRange(
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }))

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Tokens por día</CardTitle>
          <CardDescription>Total de tokens consumidos por proveedor</CardDescription>
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
            <LineChart data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={Math.max(0, Math.floor(chartData.length / 10) - 1)}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="openai"
                type="monotone"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="gemini"
                type="monotone"
                stroke="var(--chart-2)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
