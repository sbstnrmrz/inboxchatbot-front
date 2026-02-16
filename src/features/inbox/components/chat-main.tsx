import type { MessageDirection } from "@/types/message.type";
import { MessageBubble } from "./message-bubble"
import { MessageInput } from "./message-input"

export const ChatMain = () => {
  function getRandomDir() {
    const dirs = ['OUTBOUND', 'INBOUND'];
    const randomIndex = Math.floor(Math.random() * dirs.length);
    return dirs[randomIndex] as MessageDirection;
  }

  return (
    <div className="flex flex-col h-full bg-primary-white">
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 py-4">
        {Array.from({length: 14}, (_, i) => {
          return (
            <>
              <MessageBubble key={i} direction={getRandomDir()}/>
            </>
          ) 
        })}
      </div>
      <div className=" px-4 pb-4 shrink-0">
        <MessageInput/>
      </div>
    </div>
  )
}

function DateSeparator() {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="flex w-full h-[1px] bg-black"></span>
      <span className="px-4 shrink-0">{(new Date().toLocaleString())}</span>
      <span className="flex w-full h-[1px] bg-black"></span>
    </div>
  )
}

