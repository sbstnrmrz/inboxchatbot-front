import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDownIcon, TrendingUp, TrendingUpIcon } from "lucide-react"

interface StatsCardProps {
  title?: string;
  description?: string;
  subtitle?: string;
}

export const StatsCard = ({title = 'Titulo', description = 'Description'}: StatsCardProps) => {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {title}
        </CardTitle>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          1242352 tokens usados 
        </div>
      </CardFooter>
    </Card>
  )
}

