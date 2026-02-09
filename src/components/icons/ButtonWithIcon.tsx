import { Send } from "lucide-react"
import { Button } from "../ui/button"
import { type JSX } from "react";

interface ButtonWithIconProps {
  type?: 'submit' | 'reset' | 'button';
  onClick?: () => void;
  className?: string;
  icon?: JSX.Element;
  disabled?: boolean;
}

export const ButtonWithIcon = ({
  disabled = false,
  type = 'button',
  onClick,
  className,
  icon,
}: ButtonWithIconProps) => {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      type={type}
      className={`rounded-full ${className} ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
      size={'icon'}
    >
      {icon}
    </Button>
  )
}

