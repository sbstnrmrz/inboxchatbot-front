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
import { useAdminCustomerCountByRange } from "@/features/admin/hooks/useAdminStats"

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

interface AdminCustomersChartProps {
  tenantId: string | null
  range: DateRange | undefined
}

export function AdminCustomersChart({ tenantId, range }: AdminCustomersChartProps) {
  const { data, isLoading } = useAdminCustomerCountByRange(
    tenantId,
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
                <linearGradient id="adminFillCustomerWhatsapp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="adminFillCustomerInstagram" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#adminFillCustomerInstagram)"
                stroke="var(--chart-2)"
                strokeWidth={2}
              />
              <Area
                dataKey="whatsapp"
                type="monotone"
                fill="url(#adminFillCustomerWhatsapp)"
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
