import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "./stats-card";
import { MessagesChart } from "./messages-chart";
import { CustomersChart } from "./customers-chart";
import { LlmUsageCard } from "./llm-usage-card";
import { LlmUsageChart } from "./llm-usage-chart";
import { useLlmUsageTotals } from "@/features/inbox/hooks/useLlmUsage";
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

function TokensTab() {
  const { data, isLoading } = useLlmUsageTotals()

  return (
    <div className="flex flex-col gap-6 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <LlmUsageCard provider="openai" channels={data?.openai ?? {}} isLoading={isLoading} />
        <LlmUsageCard provider="gemini" channels={data?.gemini ?? {}} isLoading={isLoading} />
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
          title={today.isLoading ? "—" : String(today.data?.count ?? 0)}
        />
        <StatsCard
          description="Nuevos esta semana"
          title={week.isLoading ? "—" : String(week.data?.count ?? 0)}
        />
        <StatsCard
          description="Nuevos este mes"
          title={month.isLoading ? "—" : String(month.data?.count ?? 0)}
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
          title={today.isLoading ? "—" : String(today.data?.count ?? 0)}
        />
        <StatsCard
          description="Mensajes esta semana"
          title={week.isLoading ? "—" : String(week.data?.count ?? 0)}
        />
        <StatsCard
          description="Mensajes este mes"
          title={month.isLoading ? "—" : String(month.data?.count ?? 0)}
        />
      </div>
      <MessagesChart />
    </div>
  )
}

export function StatisticsPage() {
  return (
    <div className="flex flex-col p-8 w-full h-full">
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
