import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export const ChatMessage = ({ role, content }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg p-4 transition-colors",
        role === "user" 
          ? "ml-auto max-w-[80%] bg-primary text-primary-foreground" 
          : "mr-auto max-w-[80%] bg-card shadow-sm"
      )}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        role === "user" ? "bg-primary-foreground/20" : "bg-primary/10"
      )}>
        {role === "user" ? (
          <User className="h-4 w-4" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </p>
      </div>
    </div>
  );
};
