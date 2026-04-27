import type { DateRange } from "react-day-picker"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useAdminBookingCountByRange } from "@/features/admin/hooks/useAdminStats"

const chartConfig = {
  total: {
    label: "Agendamientos",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-")
  return `${day}/${month}/${year.slice(2)}`
}

interface AdminBookingsChartProps {
  tenantId: string | null
  range: DateRange | undefined
}

export function AdminBookingsChart({ tenantId, range }: AdminBookingsChartProps) {
  const { data, isLoading } = useAdminBookingCountByRange(
    tenantId,
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const chartData = data.map((d) => ({ ...d, date: formatDate(d.date) }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendamientos por día</CardTitle>
        <CardDescription>Total de agendamientos diarios</CardDescription>
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
                <linearGradient id="adminFillBookingsTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
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
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={32} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="total"
                type="monotone"
                fill="url(#adminFillBookingsTotal)"
                stroke="var(--chart-3)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
