import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "./stats-card";
import { MessagesChart } from "./messages-chart";
import { DateRangePicker } from "./date-range-picker";
import { CustomersChart } from "./customers-chart";
import { BookingsChart } from "./bookings-chart";
import { LlmUsageCard } from "./llm-usage-card";
import { LlmUsageChart } from "./llm-usage-chart";
import {
  useLlmUsageTotals,
  useLlmUsageToday,
  useLlmUsageThisWeek,
  useLlmUsageThisMonth,
} from "@/features/inbox/hooks/useLlmUsage";
import type { LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries";
import {
  useMessageCountToday,
  useMessageCountThisWeek,
  useMessageCountThisMonth,
  useMessageCountByRange,
} from "@/features/inbox/hooks/useMessageStats";
import {
  useCustomerCountToday,
  useCustomerCountThisWeek,
  useCustomerCountThisMonth,
  useCustomerCountByRange,
} from "@/features/inbox/hooks/useCustomerStats"
import {
  useBookingCountToday,
  useBookingCountThisWeek,
  useBookingCountThisMonth,
  useBookingCountByRange,
  useBookingCreatedToday,
  useBookingCreatedThisWeek,
  useBookingCreatedThisMonth,
} from "@/features/inbox/hooks/useBookingStats";

const PRICING: Record<string, { input: number; output: number }> = {
  openai: { input: 1.75, output: 14 },
  gemini: { input: 0.5,  output: 3  },
}

function calcProviderCost(provider: string, channels: LlmUsageTotals[keyof LlmUsageTotals]): number {
  const rates = PRICING[provider]
  if (!rates || !channels) return 0
  return Object.values(channels).reduce((sum, ch) => {
    if (!ch) return sum
    const inputCost  = (ch.inputTokens  / 1_000_000) * rates.input
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

function OverviewTab() {
  const msgToday  = useMessageCountToday()
  const msgWeek   = useMessageCountThisWeek()
  const msgMonth  = useMessageCountThisMonth()

  const cusToday  = useCustomerCountToday()
  const cusWeek   = useCustomerCountThisWeek()
  const cusMonth  = useCustomerCountThisMonth()

  const bkCreatedToday = useBookingCreatedToday()
  const bkCreatedWeek  = useBookingCreatedThisWeek()
  const bkCreatedMonth = useBookingCreatedThisMonth()

  const tokToday  = useLlmUsageToday()
  const tokWeek   = useLlmUsageThisWeek()
  const tokMonth  = useLlmUsageThisMonth()

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

function TokensTab() {
  const totals = useLlmUsageTotals()
  const today  = useLlmUsageToday()
  const week   = useLlmUsageThisWeek()
  const month  = useLlmUsageThisMonth()

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
      <LlmUsageChart />
    </div>
  )
}

function defaultCustomersRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from, to }
}

function CustomersTab() {
  const today = useCustomerCountToday()
  const week = useCustomerCountThisWeek()
  const month = useCustomerCountThisMonth()

  const [range, setRange] = useState<DateRange | undefined>(defaultCustomersRange)
  const { data: rangeData, isLoading: rangeLoading } = useCustomerCountByRange(
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
            <CustomersChart range={range} />
          </div>
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

function MessagesTab() {
  const today = useMessageCountToday()
  const week = useMessageCountThisWeek()
  const month = useMessageCountThisMonth()

  const [range, setRange] = useState<DateRange | undefined>(defaultRange)
  const { data: rangeData, isLoading: rangeLoading } = useMessageCountByRange(
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
            <MessagesChart range={range} />
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

function BookingsTab() {
  const today = useBookingCountToday()
  const week  = useBookingCountThisWeek()
  const month = useBookingCountThisMonth()

  const createdToday = useBookingCreatedToday()
  const createdWeek  = useBookingCreatedThisWeek()
  const createdMonth = useBookingCreatedThisMonth()

  const [range, setRange] = useState<DateRange | undefined>(defaultBookingsRange)
  const { data: rangeData, isLoading: rangeLoading } = useBookingCountByRange(
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
            <BookingsChart range={range} />
          </div>
        </div>
      </div>
    </div>
  )
}

export function StatisticsPage() {
  return (
    <div className="flex flex-col p-8 w-full min-h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Estadísticas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Métricas de uso de la plataforma.
        </p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="bookings">Agendamientos</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab />
        </TabsContent>

        <TabsContent value="tokens">
          <TokensTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
