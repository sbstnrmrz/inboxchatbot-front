import { Phone, Mail, User } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CachedCustomer } from "@/lib/db"

interface CustomerInfoProps {
  customer: CachedCustomer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const CustomerInfo = ({ customer, open, onOpenChange }: CustomerInfoProps) => {
  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader className="sr-only">
          <SheetTitle>Customer info</SheetTitle>
          <SheetDescription>Contact details for {customer.name}</SheetDescription>
        </SheetHeader>

        {/* Profile section */}
        <div className="flex flex-col items-center gap-3 pt-6 pb-6 border-b">
          <Avatar className="w-16 h-16 text-lg">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-base">{customer.name}</p>
            {customer.isBlocked && (
              <Badge variant="destructive" className="mt-1 text-xs">
                Blocked
              </Badge>
            )}
          </div>
        </div>

        {/* Contact details */}
        <div className="flex flex-col gap-4 pt-6 px-1">
          {/* Phone */}
          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Phone</span>
              <span className="text-sm">
                {customer.whatsappId ?? (
                  <span className="text-muted-foreground italic">Not available</span>
                )}
              </span>
            </div>
          </div>

          {/* Email — not yet implemented */}
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-sm text-muted-foreground italic">
                Not available
              </span>
            </div>
          </div>

          {/* Customer ID */}
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Customer ID</span>
              <span className="text-sm font-mono text-muted-foreground break-all">
                {customer.id}
              </span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
