import type { DateRange } from "react-day-picker"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useCustomerCountByRange } from "@/features/inbox/hooks/useCustomerStats"

const chartConfig = {
  whatsapp: {
    label: "WhatsApp",
    color: "var(--chart-1)",
  },
  instagram: {
    label: "Instagram",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year.slice(2)}`
}

interface CustomersChartProps {
  range: DateRange | undefined
}

export function CustomersChart({ range }: CustomersChartProps) {
  const { data, isLoading } = useCustomerCountByRange(
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes por día</CardTitle>
        <CardDescription>Nuevos clientes por canal</CardDescription>
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
                <linearGradient id="fillCustomerWhatsapp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fillCustomerInstagram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
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
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="instagram"
                type="monotone"
                fill="url(#fillCustomerInstagram)"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
              <Area
                dataKey="whatsapp"
                type="monotone"
                fill="url(#fillCustomerWhatsapp)"
                stroke="var(--chart-1)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
