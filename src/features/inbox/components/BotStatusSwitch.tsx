import { Switch } from "@/components/ui/switch";
import { BotIcon } from "lucide-react"

interface BotStatusSwitch {
  botEnabled: boolean;
  onToggleBotEnabled?: (checked: boolean) => void;
  isTogglingBot?: boolean;
}

export const BotStatusSwitch = ({
  botEnabled, 
  onToggleBotEnabled, 
  isTogglingBot
}: BotStatusSwitch) => {
  return (
    <div className="flex items-center gap-2">
      <BotIcon className={`${botEnabled ? 'stroke-green-600' : 'stroke-black/50'}`}/>
      <Switch 
        className="data-[state=checked]:bg-green-600 cursor-pointer"
        checked={botEnabled}
        onCheckedChange={onToggleBotEnabled}
        disabled={isTogglingBot}
      />
    </div>
  )
}

