import { ButtonWithIcon } from "@/components/icons/ButtonWithIcon";
import { SendIcon, Trash2Icon } from "lucide-react";
import { BotStatusSwitch } from "./BotStatusSwitch";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  sendMessageSchema,
  type SendMessageFormData,
} from "@/features/inbox/schemas/message.schema";

export interface MessageInputProps {
  botEnabled: boolean;
  isTogglingBot: boolean;
  onToggleBot: () => void;
  onSend: (body: string) => void;
  isSending?: boolean;
}

export const MessageInput = ({
  botEnabled,
  isTogglingBot,
  onToggleBot,
  onSend,
  isSending = false,
}: MessageInputProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: { body: "" },
  });

  const body = watch("body");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [body]);

  const onSubmit = (data: SendMessageFormData) => {
    onSend(data.body);
    reset();
  };

  const handleCancelRecording = () => {};

  const isRecording = false;
  const isTextDisabled = botEnabled || isSending;

  // Register the textarea and merge with our ref for auto-resize
  const { ref: registerRef, ...registerRest } = register("body");

  return (
    <div className="w-full mx-auto bg-primary-white">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div
          className={`relative flex flex-col bg-primary-white md:rounded-lg shadow-sm ${
            botEnabled ? "bg-muted/50 " : "bg-white "
          }`}
        >
          {/* Textarea */}
          <textarea
            {...registerRest}
            ref={(el) => {
              registerRef(el);
              (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
            }}
            placeholder={
              isRecording
                ? "Grabando audio..."
                : botEnabled
                  ? "Las respuestas automáticas están activas..."
                  : "Envía un mensaje"
            }
            rows={1}
            disabled={isTextDisabled}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(onSubmit);
              }
            }}
            className={`text-black w-full resize-none bg-transparent px-4 pt-4 pb-2 focus:outline-none min-h-[52px] max-h-[200px] ${
              isRecording || botEnabled
                ? "text-muted-foreground placeholder:text-muted-foreground/60 cursor-not-allowed"
                : "text-black placeholder:text-muted-foreground"
            }`}
          />

          {/* Validation error */}
          {errors.body && (
            <p className="px-4 pb-1 text-xs text-destructive">
              {errors.body.message}
            </p>
          )}

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3">
            {/* Left buttons */}
            <div className="flex items-center gap-1">
              {isRecording ? (
                <ButtonWithIcon
                  type="button"
                  onClick={handleCancelRecording}
                  className="bg-red-600 text-background hover:bg-red-600/70"
                  icon={<Trash2Icon className="size-5" />}
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
              disabled={botEnabled || isSending}
              className={`${botEnabled ? "cursor-not-allowed bg-white" : ""} bg-green-600 text-background hover:bg-green-600/70`}
              icon={<SendIcon className="size-6" />}
            />
          </div>
        </div>
      </form>
    </div>
  );
};
