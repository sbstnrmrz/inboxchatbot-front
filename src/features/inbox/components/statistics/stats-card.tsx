import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WhatsappIcon } from "@/components/icons/WhatsappIcon"
import { InstagramIcon } from "@/components/icons/InstagramIcon"

interface ChannelCounts {
  whatsapp?: number
  instagram?: number
}

interface StatsCardProps {
  title?: string
  description?: string
  footer?: string
  channels?: ChannelCounts
}

export const StatsCard = ({ title = "Titulo", description = "Description", footer, channels }: StatsCardProps) => {
  const hasChannels = channels && (channels.whatsapp != null || channels.instagram != null)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {title}
        </CardTitle>
      </CardHeader>
      {(footer || hasChannels) && (
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          {footer && (
            <div className="line-clamp-1 flex gap-2 font-medium text-muted-foreground">
              {footer}
            </div>
          )}
          {hasChannels && (
            <div className="flex gap-4">
              {channels.whatsapp != null && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <WhatsappIcon className="size-3.5 shrink-0" />
                  <span className="tabular-nums">{channels.whatsapp.toLocaleString("es-MX")}</span>
                </div>
              )}
              {channels.instagram != null && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <InstagramIcon className="size-3.5 shrink-0" />
                  <span className="tabular-nums">{channels.instagram.toLocaleString("es-MX")}</span>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
