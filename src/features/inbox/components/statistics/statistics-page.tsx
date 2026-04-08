import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "./stats-card";
import { MessagesChart } from "./messages-chart";
import { CustomersChart } from "./customers-chart";
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
} from "@/features/inbox/hooks/useMessageStats";
import {
  useCustomerCountToday,
  useCustomerCountThisWeek,
  useCustomerCountThisMonth,
} from "@/features/inbox/hooks/useCustomerStats";

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

function CustomersTab() {
  const today = useCustomerCountToday()
  const week = useCustomerCountThisWeek()
  const month = useCustomerCountThisMonth()

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
      <CustomersChart />
    </div>
  )
}

function MessagesTab() {
  const today = useMessageCountToday()
  const week = useMessageCountThisWeek()
  const month = useMessageCountThisMonth()

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
      <MessagesChart />
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
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-3 gap-4 mt-4">
            <StatsCard
              description="Tokens de OpenAI"
              title="$243435"
            />
            <StatsCard
              description="Tokens de Gemini"
              title="$243435"
            />
          </div>
        </TabsContent>

        <TabsContent value="messages">
          <MessagesTab />
        </TabsContent>

        <TabsContent value="customers">
          <CustomersTab />
        </TabsContent>

        <TabsContent value="tokens">
          <TokensTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
