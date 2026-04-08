import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChannelUsage } from "@/features/inbox/api/llm-usage.queries"

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
}

const PRICING: Record<string, { input: number; output: number }> = {
  openai:  { input: 1.75, output: 14 },
  gemini:  { input: 0.5,  output: 3  },
}

function calcCost(
  provider: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const rates = PRICING[provider.toLowerCase()]
  if (!rates) return 0
  return (inputTokens * rates.input + outputTokens * rates.output) / 1_000_000
}

function formatNumber(n: number) {
  return n.toLocaleString("es-MX")
}

function formatCost(usd: number) {
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4 })
}

interface LlmUsageCardProps {
  provider: string
  channels: Partial<Record<string, ChannelUsage>>
  isLoading?: boolean
}

const placeholder = "—"

export function LlmUsageCard({ provider, channels, isLoading }: LlmUsageCardProps) {
  const entries = Object.entries(channels)

  const totalTokens = entries.reduce((sum, [, ch]) => sum + (ch?.totalTokens ?? 0), 0)
  const totalCalls  = entries.reduce((sum, [, ch]) => sum + (ch?.calls ?? 0), 0)
  const totalCost   = entries.reduce(
    (sum, [, ch]) => sum + calcCost(provider, ch?.inputTokens ?? 0, ch?.outputTokens ?? 0),
    0,
  )

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
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Cargando...</div>
        ) : entries.length === 0 ? (
          <div className="text-sm text-muted-foreground">Sin datos</div>
        ) : (
          entries.map(([channel, usage]) => {
            const channelCost = calcCost(provider, usage?.inputTokens ?? 0, usage?.outputTokens ?? 0)
            return (
              <div key={channel} className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <span className="font-medium col-span-2 text-muted-foreground">
                  {CHANNEL_LABELS[channel] ?? channel}
                </span>
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
