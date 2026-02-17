import { ButtonWithIcon } from "@/components/icons/ButtonWithIcon";
import { SendIcon, Trash2Icon } from "lucide-react";
import { BotStatusSwitch } from "./BotStatusSwitch";

export interface MessageInputProps {
  botEnabled: boolean;
  isTogglingBot: boolean;
  onToggleBot: () => void;
}

export const MessageInput = ({ botEnabled, isTogglingBot, onToggleBot }: MessageInputProps) => {
  const handleSubmit = () => {}
  const handleCancelRecording = () => {}

  const isRecording = false;
  const isTextDisabled = botEnabled;

  return (
    <div className="w-full mx-auto bg-primary-white">
      <form onSubmit={handleSubmit}>
        <div className={`relative flex flex-col bg-primary-white md:rounded-lg shadow-sm ${
botEnabled
? "bg-muted/50 "
: "bg-white "
}`}>
          {/* Textarea */}
          <textarea
            placeholder={
              isRecording
                ? "Grabando audio..."
                : botEnabled
                  ? "Las respuestas automáticas están activas..."
                  : "Envía un mensaje"
            }
            rows={1}
            disabled={isTextDisabled}
            className={`text-black w-full resize-none bg-transparent px-4 pt-4 pb-2 focus:outline-none min-h-[52px] max-h-[200px] ${
isRecording || botEnabled
? "text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed"
: "text-black placeholder:text-muted-foreground"
}`}
          />

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Left buttons */}
            <div className="flex items-center gap-1">
              {isRecording ? (
                <ButtonWithIcon
                  type="button"
                  onClick={handleCancelRecording}
                  className="bg-red-600 text-background hover:bg-red-600/70"
                  icon={<Trash2Icon className="size-5"/>}
                />
              ) : (
                  <BotStatusSwitch
                    botEnabled={botEnabled}
                    onToggleBotEnabled={onToggleBot}
                    isTogglingBot={isTogglingBot}
                  />
                )}
            </div>
            <ButtonWithIcon
              type="submit"
              disabled={botEnabled}
              className="bg-green-600 text-background hover:bg-green-600/70"
              icon={<SendIcon className="size-6"/>}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
