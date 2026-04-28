import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StatsCard } from "@/features/inbox/components/statistics/stats-card"
import { DateRangePicker } from "@/features/inbox/components/statistics/date-range-picker"
import { LlmUsageCard } from "@/features/inbox/components/statistics/llm-usage-card"
import { AdminMessagesChart } from "./admin-messages-chart"
import { AdminCustomersChart } from "./admin-customers-chart"
import { AdminLlmUsageChart } from "./admin-llm-usage-chart"
import { AdminBookingsChart } from "./admin-bookings-chart"
import { useTenants } from "@/features/admin/hooks/useTenants"
import {
  useAdminMessageCountToday,
  useAdminMessageCountThisWeek,
  useAdminMessageCountThisMonth,
  useAdminMessageCountByRange,
  useAdminCustomerCountToday,
  useAdminCustomerCountThisWeek,
  useAdminCustomerCountThisMonth,
  useAdminCustomerCountByRange,
  useAdminLlmUsageTotals,
  useAdminLlmUsageToday,
  useAdminLlmUsageThisWeek,
  useAdminLlmUsageThisMonth,
  useAdminBookingCountToday,
  useAdminBookingCountThisWeek,
  useAdminBookingCountThisMonth,
  useAdminBookingCountByRange,
  useAdminBookingCreatedToday,
  useAdminBookingCreatedThisWeek,
  useAdminBookingCreatedThisMonth,
} from "@/features/admin/hooks/useAdminStats"
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"

const PRICING: Record<string, { input: number; output: number }> = {
  openai: { input: 1.25, output: 10 },
  gemini: { input: 0.5, output: 3 },
}

function calcProviderCost(provider: string, channels: LlmUsageTotals[keyof LlmUsageTotals]): number {
  const rates = PRICING[provider]
  if (!rates || !channels) return 0
  return Object.values(channels).reduce((sum, ch) => {
    if (!ch) return sum
    const inputCost = (ch.inputTokens / 1_000_000) * rates.input
    const outputCost = (ch.outputTokens / 1_000_000) * rates.output
    return sum + inputCost + outputCost
  }, 0)
}

function calcTotalCost(data: LlmUsageTotals | undefined): number {
  if (!data) return 0
  return calcProviderCost("openai", data.openai) + calcProviderCost("gemini", data.gemini)
}

function calcTotalTokens(data: LlmUsageTotals | undefined): number {
  if (!data) return 0
  const sum = (channels: LlmUsageTotals[keyof LlmUsageTotals]) =>
    channels ? Object.values(channels).reduce((s, ch) => s + (ch?.totalTokens ?? 0), 0) : 0
  return sum(data.openai) + sum(data.gemini)
}

function formatTokens(n: number) {
  return `${n.toLocaleString("es-MX")} tokens`
}

function formatCost(usd: number) {
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 })
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h2>
}

interface TabProps {
  tenantId: string | null
}

function OverviewTab({ tenantId }: TabProps) {
  const msgToday = useAdminMessageCountToday(tenantId)
  const msgWeek = useAdminMessageCountThisWeek(tenantId)
  const msgMonth = useAdminMessageCountThisMonth(tenantId)

  const cusToday = useAdminCustomerCountToday(tenantId)
  const cusWeek = useAdminCustomerCountThisWeek(tenantId)
  const cusMonth = useAdminCustomerCountThisMonth(tenantId)

  const tokToday = useAdminLlmUsageToday(tenantId)
  const tokWeek = useAdminLlmUsageThisWeek(tenantId)
  const tokMonth = useAdminLlmUsageThisMonth(tenantId)

  const bkCreatedToday = useAdminBookingCreatedToday(tenantId)
  const bkCreatedWeek  = useAdminBookingCreatedThisWeek(tenantId)
  const bkCreatedMonth = useAdminBookingCreatedThisMonth(tenantId)

  return (
    <div className="flex flex-col gap-8 mt-4">
      <div className="flex flex-col gap-3">
        <SectionHeader title="Mensajes" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Mensajes hoy"
            title={msgToday.isLoading ? "—" : String(msgToday.data?.total ?? 0)}
            channels={{ whatsapp: msgToday.data?.whatsapp, instagram: msgToday.data?.instagram }}
          />
          <StatsCard
            description="Mensajes esta semana"
            title={msgWeek.isLoading ? "—" : String(msgWeek.data?.total ?? 0)}
            channels={{ whatsapp: msgWeek.data?.whatsapp, instagram: msgWeek.data?.instagram }}
          />
          <StatsCard
            description="Mensajes este mes"
            title={msgMonth.isLoading ? "—" : String(msgMonth.data?.total ?? 0)}
            channels={{ whatsapp: msgMonth.data?.whatsapp, instagram: msgMonth.data?.instagram }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader title="Clientes" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Nuevos hoy"
            title={cusToday.isLoading ? "—" : String(cusToday.data?.total ?? 0)}
            channels={{ whatsapp: cusToday.data?.whatsapp, instagram: cusToday.data?.instagram }}
          />
          <StatsCard
            description="Nuevos esta semana"
            title={cusWeek.isLoading ? "—" : String(cusWeek.data?.total ?? 0)}
            channels={{ whatsapp: cusWeek.data?.whatsapp, instagram: cusWeek.data?.instagram }}
          />
          <StatsCard
            description="Nuevos este mes"
            title={cusMonth.isLoading ? "—" : String(cusMonth.data?.total ?? 0)}
            channels={{ whatsapp: cusMonth.data?.whatsapp, instagram: cusMonth.data?.instagram }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader title="Agendamientos" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Creados hoy"
            title={bkCreatedToday.isLoading ? "—" : String(bkCreatedToday.data?.total ?? 0)}
          />
          <StatsCard
            description="Creados esta semana"
            title={bkCreatedWeek.isLoading ? "—" : String(bkCreatedWeek.data?.total ?? 0)}
          />
          <StatsCard
            description="Creados este mes"
            title={bkCreatedMonth.isLoading ? "—" : String(bkCreatedMonth.data?.total ?? 0)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <SectionHeader title="Tokens" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Costo hoy"
            title={tokToday.isLoading ? "—" : formatCost(calcTotalCost(tokToday.data))}
            footer={tokToday.isLoading ? undefined : formatTokens(calcTotalTokens(tokToday.data))}
          />
          <StatsCard
            description="Costo esta semana"
            title={tokWeek.isLoading ? "—" : formatCost(calcTotalCost(tokWeek.data))}
            footer={tokWeek.isLoading ? undefined : formatTokens(calcTotalTokens(tokWeek.data))}
          />
          <StatsCard
            description="Costo este mes"
            title={tokMonth.isLoading ? "—" : formatCost(calcTotalCost(tokMonth.data))}
            footer={tokMonth.isLoading ? undefined : formatTokens(calcTotalTokens(tokMonth.data))}
          />
        </div>
      </div>
    </div>
  )
}

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from, to }
}

function MessagesTab({ tenantId }: TabProps) {
  const today = useAdminMessageCountToday(tenantId)
  const week = useAdminMessageCountThisWeek(tenantId)
  const month = useAdminMessageCountThisMonth(tenantId)

  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const { data: rangeData, isLoading: rangeLoading } = useAdminMessageCountByRange(
    tenantId,
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const rangeTotal = rangeData.reduce((sum, d) => sum + d.total, 0)
  const rangeWhatsapp = rangeData.reduce((sum, d) => sum + d.whatsapp, 0)
  const rangeInstagram = rangeData.reduce((sum, d) => sum + d.instagram, 0)

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          description="Mensajes hoy"
          title={today.isLoading ? "—" : String(today.data?.total ?? 0)}
          channels={{ whatsapp: today.data?.whatsapp, instagram: today.data?.instagram }}
        />
        <StatsCard
          description="Mensajes esta semana"
          title={week.isLoading ? "—" : String(week.data?.total ?? 0)}
          channels={{ whatsapp: week.data?.whatsapp, instagram: week.data?.instagram }}
        />
        <StatsCard
          description="Mensajes este mes"
          title={month.isLoading ? "—" : String(month.data?.total ?? 0)}
          channels={{ whatsapp: month.data?.whatsapp, instagram: month.data?.instagram }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <DateRangePicker className="bg-white" value={range} onChange={setRange} />
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            description="Total en el rango"
            title={rangeLoading ? "—" : String(rangeTotal)}
            channels={{ whatsapp: rangeLoading ? undefined : rangeWhatsapp, instagram: rangeLoading ? undefined : rangeInstagram }}
          />
          <div className="col-span-3">
            <AdminMessagesChart tenantId={tenantId} range={range} />
          </div>
        </div>
      </div>
    </div>
  )
}

function CustomersTab({ tenantId }: TabProps) {
  const today = useAdminCustomerCountToday(tenantId)
  const week = useAdminCustomerCountThisWeek(tenantId)
  const month = useAdminCustomerCountThisMonth(tenantId)

  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const { data: rangeData, isLoading: rangeLoading } = useAdminCustomerCountByRange(
    tenantId,
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const rangeTotal = rangeData.reduce((sum, d) => sum + d.total, 0)
  const rangeWhatsapp = rangeData.reduce((sum, d) => sum + d.whatsapp, 0)
  const rangeInstagram = rangeData.reduce((sum, d) => sum + d.instagram, 0)

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          description="Nuevos hoy"
          title={today.isLoading ? "—" : String(today.data?.total ?? 0)}
          channels={{ whatsapp: today.data?.whatsapp, instagram: today.data?.instagram }}
        />
        <StatsCard
          description="Nuevos esta semana"
          title={week.isLoading ? "—" : String(week.data?.total ?? 0)}
          channels={{ whatsapp: week.data?.whatsapp, instagram: week.data?.instagram }}
        />
        <StatsCard
          description="Nuevos este mes"
          title={month.isLoading ? "—" : String(month.data?.total ?? 0)}
          channels={{ whatsapp: month.data?.whatsapp, instagram: month.data?.instagram }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <DateRangePicker className="bg-white" value={range} onChange={setRange} />
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            description="Total en el rango"
            title={rangeLoading ? "—" : String(rangeTotal)}
            channels={{ whatsapp: rangeLoading ? undefined : rangeWhatsapp, instagram: rangeLoading ? undefined : rangeInstagram }}
          />
          <div className="col-span-3">
            <AdminCustomersChart tenantId={tenantId} range={range} />
          </div>
        </div>
      </div>
    </div>
  )
}

function defaultBookingsRange(): DateRange {
  const from = new Date()
  const to = new Date()
  to.setDate(to.getDate() + 29)
  return { from, to }
}

function BookingsTab({ tenantId }: TabProps) {
  const today = useAdminBookingCountToday(tenantId)
  const week  = useAdminBookingCountThisWeek(tenantId)
  const month = useAdminBookingCountThisMonth(tenantId)

  const createdToday = useAdminBookingCreatedToday(tenantId)
  const createdWeek  = useAdminBookingCreatedThisWeek(tenantId)
  const createdMonth = useAdminBookingCreatedThisMonth(tenantId)

  const [range, setRange] = useState<DateRange | undefined>(defaultBookingsRange)
  const { data: rangeData, isLoading: rangeLoading } = useAdminBookingCountByRange(
    tenantId,
    range?.from ?? new Date(),
    range?.to ?? new Date(),
  )

  const rangeTotal = rangeData.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="flex flex-col gap-3">
        <SectionHeader title="Próximos" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Agendamientos hoy"
            title={today.isLoading ? "—" : String(today.data?.total ?? 0)}
          />
          <StatsCard
            description="Restantes esta semana"
            title={week.isLoading ? "—" : String(week.data?.total ?? 0)}
          />
          <StatsCard
            description="Restantes este mes"
            title={month.isLoading ? "—" : String(month.data?.total ?? 0)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <SectionHeader title="Creados" />
        <div className="grid grid-cols-3 gap-4">
          <StatsCard
            description="Creados hoy"
            title={createdToday.isLoading ? "—" : String(createdToday.data?.total ?? 0)}
          />
          <StatsCard
            description="Creados esta semana"
            title={createdWeek.isLoading ? "—" : String(createdWeek.data?.total ?? 0)}
          />
          <StatsCard
            description="Creados este mes"
            title={createdMonth.isLoading ? "—" : String(createdMonth.data?.total ?? 0)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <DateRangePicker className="bg-white" value={range} onChange={setRange} />
        <div className="grid grid-cols-4 gap-4">
          <StatsCard
            description="Total en el rango"
            title={rangeLoading ? "—" : String(rangeTotal)}
          />
          <div className="col-span-3">
            <AdminBookingsChart tenantId={tenantId} range={range} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TokensTab({ tenantId }: TabProps) {
  const totals = useAdminLlmUsageTotals(tenantId)
  const today = useAdminLlmUsageToday(tenantId)
  const week = useAdminLlmUsageThisWeek(tenantId)
  const month = useAdminLlmUsageThisMonth(tenantId)

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          description="Costo hoy"
          title={today.isLoading ? "—" : formatCost(calcTotalCost(today.data))}
          footer={today.isLoading ? undefined : formatTokens(calcTotalTokens(today.data))}
        />
        <StatsCard
          description="Costo esta semana"
          title={week.isLoading ? "—" : formatCost(calcTotalCost(week.data))}
          footer={week.isLoading ? undefined : formatTokens(calcTotalTokens(week.data))}
        />
        <StatsCard
          description="Costo este mes"
          title={month.isLoading ? "—" : formatCost(calcTotalCost(month.data))}
          footer={month.isLoading ? undefined : formatTokens(calcTotalTokens(month.data))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <LlmUsageCard
          provider="openAI"
          channels={totals.data?.openai ?? {}}
          isLoading={totals.isLoading}
          today={{ channels: today.data?.openai ?? {}, isLoading: today.isLoading }}
          week={{ channels: week.data?.openai ?? {}, isLoading: week.isLoading }}
          month={{ channels: month.data?.openai ?? {}, isLoading: month.isLoading }}
        />
        <LlmUsageCard
          provider="gemini"
          channels={totals.data?.gemini ?? {}}
          isLoading={totals.isLoading}
          today={{ channels: today.data?.gemini ?? {}, isLoading: today.isLoading }}
          week={{ channels: week.data?.gemini ?? {}, isLoading: week.isLoading }}
          month={{ channels: month.data?.gemini ?? {}, isLoading: month.isLoading }}
        />
      </div>
      <AdminLlmUsageChart tenantId={tenantId} />
    </div>
  )
}

export function AdminStatisticsPage() {
  const { data: tenants, isLoading: tenantsLoading } = useTenants()
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)

  return (
    <div className="flex flex-col p-6 w-full min-h-full overflow-y-auto">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Métricas de uso por tenant.
          </p>
        </div>
        <Select
          value={selectedTenantId ?? ""}
          onValueChange={(val) => setSelectedTenantId(val || null)}
          disabled={tenantsLoading}
        >
          <SelectTrigger className="w-64 bg-white">
            <SelectValue placeholder="Seleccionar tenant..." />
          </SelectTrigger>
          <SelectContent>
            {tenants?.map((t) => (
              <SelectItem key={t._id} value={t._id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTenantId && (
        <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">
          Selecciona un tenant para ver sus estadísticas.
        </div>
      )}

      {selectedTenantId && (
        <Tabs defaultValue="overview">
          <TabsList variant="line">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="messages">Mensajes</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
            <TabsTrigger value="bookings">Agendamientos</TabsTrigger>
            <TabsTrigger value="tokens">Tokens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab tenantId={selectedTenantId} />
          </TabsContent>

          <TabsContent value="messages">
            <MessagesTab tenantId={selectedTenantId} />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab tenantId={selectedTenantId} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsTab tenantId={selectedTenantId} />
          </TabsContent>

          <TabsContent value="tokens">
            <TokensTab tenantId={selectedTenantId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
