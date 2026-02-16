import { ChatLayoutHeader } from "./chat-layout-header"

interface ChatLayoutProps {
  children?: React.ReactNode
}

export const ChatLayout = ({children}: ChatLayoutProps) => {
  return (
    <div className="flex flex-col h-full">
      {children}
    </div>
  )
}

