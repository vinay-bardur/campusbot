import { useState, useEffect, useRef } from "react";
import { ChatSidebar, ChatSidebarTrigger } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { streamChat } from "@/lib/chatApi";
import { addConversation, updateConversation } from "@/lib/localDb";
import { toast } from "sonner";
import { Loader2, HelpCircle, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createNewConversation = () => {
    const conv = addConversation("New Chat");
    return conv.id;
  };

  const saveMessage = (conversationId: string, role: "user" | "assistant", content: string) => {
    const key = `messages_${conversationId}`;
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    messages.push({ role, content, created_at: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(messages));
  };

  const updateConversationTitle = (conversationId: string, firstMessage: string) => {
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
    updateConversation(conversationId, title);
  };

  const handleSend = async (input: string) => {
    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = createNewConversation();
      setCurrentConversationId(conversationId);
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    saveMessage(conversationId, "user", input);

    if (messages.length === 0) {
      updateConversationTitle(conversationId, input);
    }

    let assistantContent = "";
    const assistantMessage: Message = { role: "assistant", content: "" };

    const updateAssistantMessage = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: "assistant", content: assistantContent }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistantMessage,
        onDone: () => {
          setIsLoading(false);
          saveMessage(conversationId!, "assistant", assistantContent);
        },
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
        },
      });
    } catch (error) {
      toast.error("Failed to get response");
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    const key = `messages_${conversationId}`;
    const savedMessages = JSON.parse(localStorage.getItem(key) || '[]');
    setMessages(savedMessages.map((m: any) => ({ role: m.role, content: m.content })));
  };

  const handleQuickAction = (action: string) => {
    if (action === "faqs") {
      handleSend("Can you show me the frequently asked questions?");
    } else if (action === "announcements") {
      handleSend("What are the latest campus announcements?");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <ChatSidebar
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-[#d2d2d7] bg-white/80 backdrop-blur-xl px-6 py-4">
          <ChatSidebarTrigger onClick={() => setIsMobileSidebarOpen(true)} />
          <h1 className="text-[20px] font-semibold text-[#1d1d1f]">ClarifyAI</h1>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center">
                <div className="space-y-4">
                  <h2 className="text-[32px] font-semibold text-[#1d1d1f]">Welcome to ClarifyAI!</h2>
                  <p className="text-[19px] text-[#6e6e73] leading-[1.4] max-w-[500px]">
                    Your AI assistant for KLE BCA at P.C. Jabin Science College. Ask about admissions, fees, faculty, or facilities.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => handleQuickAction("faqs")}
                    className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-5 py-3 rounded-[20px] text-[15px] font-normal transition-colors flex items-center gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    View FAQs
                  </button>
                  <button
                    onClick={() => handleQuickAction("announcements")}
                    className="bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#1d1d1f] px-5 py-3 rounded-[20px] text-[15px] font-normal transition-colors flex items-center gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Latest Announcements
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <ChatMessage key={idx} role={msg.role} content={msg.content} />
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-card p-4">
          <div className="mx-auto max-w-3xl">
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
