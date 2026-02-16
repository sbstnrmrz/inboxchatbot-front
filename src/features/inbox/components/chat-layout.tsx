import { ChatLayoutHeader } from "./chat-layout-header"

interface ChatLayoutProps {
  children?: React.ReactNode
}

export const ChatLayout = ({children}: ChatLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      <ChatLayoutHeader/>
      <div className="flex-1 min-h-0">
        {children}
      </div>
    </div>
  )
}

