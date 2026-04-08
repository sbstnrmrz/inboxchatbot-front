import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"
import type { ChannelUsage, LlmUsageTotals } from "@/features/inbox/api/llm-usage.queries"

const CHANNEL_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  whatsapp: { label: "WhatsApp", icon: <WhatsappIcon className="size-4 shrink-0" /> },
  instagram: { label: "Instagram", icon: <InstagramIcon className="size-4 shrink-0" /> },
}

const PRICING: Record<string, { input: number; output: number }> = {
  openai: { input: 1.75, output: 14 },
  gemini: { input: 0.5,  output: 3  },
}

function calcCost(provider: string, channels: LlmUsageTotals[keyof LlmUsageTotals]): number {
  const rates = PRICING[provider.toLowerCase()]
  if (!rates || !channels) return 0
  return Object.values(channels).reduce((sum, ch) => {
    if (!ch) return sum
    const inputCost  = (ch.inputTokens  / 1_000_000) * rates.input
    const outputCost = (ch.outputTokens / 1_000_000) * rates.output
    return sum + inputCost + outputCost
  }, 0)
}

function sumTokens(channels: LlmUsageTotals[keyof LlmUsageTotals]): number {
  if (!channels) return 0
  return Object.values(channels).reduce((sum, ch) => sum + (ch?.totalTokens ?? 0), 0)
}

function formatNumber(n: number) {
  return n.toLocaleString("es-MX")
}

function formatCost(usd: number) {
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 })
}

interface PeriodData {
  channels: Partial<Record<string, ChannelUsage>>
  isLoading: boolean
}

interface LlmUsageCardProps {
  provider: string
  channels: Partial<Record<string, ChannelUsage>>
  isLoading?: boolean
  today?: PeriodData
  week?: PeriodData
  month?: PeriodData
}

const placeholder = "—"

function PeriodRow({
  label,
  provider,
  period,
}: {
  label: string
  provider: string
  period: PeriodData
}) {
  const tokens = sumTokens(period.channels)
  const cost   = calcCost(provider, period.channels)
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 tabular-nums">
        <span className="text-muted-foreground">{period.isLoading ? placeholder : formatNumber(tokens)}</span>
        <span className="font-medium">{period.isLoading ? placeholder : formatCost(cost)}</span>
      </div>
    </div>
  )
}

export function LlmUsageCard({ provider, channels, isLoading, today, week, month }: LlmUsageCardProps) {
  const entries    = Object.entries(channels)
  const totalTokens = entries.reduce((sum, [, ch]) => sum + (ch?.totalTokens ?? 0), 0)
  const totalCalls  = entries.reduce((sum, [, ch]) => sum + (ch?.calls ?? 0), 0)
  const totalCost   = calcCost(provider, channels)
  const hasPeriods  = today || week || month

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="capitalize">{provider}</span>
          <span className="text-muted-foreground text-sm font-normal">
            {isLoading ? placeholder : `${formatNumber(totalCalls)} llamadas`}
          </span>
        </CardTitle>
        <div className="flex items-end justify-between">
          <p className="text-3xl font-semibold tabular-nums">
            {isLoading ? placeholder : formatNumber(totalTokens)}
            {!isLoading && (
              <span className="text-muted-foreground text-sm font-normal ml-1">tokens</span>
            )}
          </p>
          {!isLoading && (
            <p className="text-lg font-semibold tabular-nums text-muted-foreground">
              {formatCost(totalCost)}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="h-px bg-border" />

        {hasPeriods && (
          <>
            <div className="flex flex-col gap-1.5">
              {today && <PeriodRow label="Hoy"         provider={provider} period={today} />}
              {week  && <PeriodRow label="Esta semana" provider={provider} period={week}  />}
              {month && <PeriodRow label="Este mes"    provider={provider} period={month} />}
            </div>
            <div className="h-px bg-border" />
          </>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : entries.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin datos</div>
        ) : (
          entries.map(([channel, usage]) => {
            const channelCost = calcCost(provider, { [channel]: usage })
            return (
              <div key={channel} className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="col-span-2 flex items-center gap-1.5 font-medium text-muted-foreground">
                  {CHANNEL_LABELS[channel]?.icon}
                  <span>{CHANNEL_LABELS[channel]?.label ?? channel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Input</span>
                  <span className="tabular-nums">{formatNumber(usage?.inputTokens ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Output</span>
                  <span className="tabular-nums">{formatNumber(usage?.outputTokens ?? 0)}</span>
                </div>
                <div className="flex justify-between col-span-2 font-medium">
                  <span>Total tokens</span>
                  <span className="tabular-nums">{formatNumber(usage?.totalTokens ?? 0)}</span>
                </div>
                <div className="flex justify-between col-span-2 font-medium">
                  <span>Costo</span>
                  <span className="tabular-nums">{formatCost(channelCost)}</span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
