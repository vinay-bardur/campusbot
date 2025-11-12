import { useState, useEffect, useRef } from "react";
import { ChatSidebar, ChatSidebarTrigger } from "@/components/chat/ChatSidebar";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { streamChat } from "@/lib/chatApi";
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

  const createNewConversation = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "New Chat" })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create conversation");
      return null;
    }
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string) => {
    try {
      await supabase
        .from("chat_messages")
        .insert({
          conversation_id: conversationId,
          role,
          content,
        });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const updateConversationTitle = async (conversationId: string, firstMessage: string) => {
    try {
      const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : "");
      await supabase
        .from("conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    } catch (error) {
      console.error("Error updating title:", error);
    }
  };

  const handleSend = async (input: string) => {
    if (!user) return;

    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = await createNewConversation();
      if (!conversationId) return;
      setCurrentConversationId(conversationId);
    }

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    await saveMessage(conversationId, "user", input);

    if (messages.length === 0) {
      await updateConversationTitle(conversationId, input);
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
        onDone: async () => {
          setIsLoading(false);
          await saveMessage(conversationId!, "assistant", assistantContent);
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId!);
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

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", conversationId)
        .order("created_at");

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
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
        <header className="flex items-center gap-3 border-b bg-card px-4 py-3 shadow-sm">
          <ChatSidebarTrigger onClick={() => setIsMobileSidebarOpen(true)} />
          <h1 className="text-lg font-semibold">ClarifyAI</h1>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center space-y-6 py-12 text-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <Loader2 className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Welcome to ClarifyAI!</h2>
                  <p className="text-muted-foreground">
                    Ask me anything about campus facilities, events, or academics.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction("faqs")}
                    className="gap-2"
                  >
                    <HelpCircle className="h-4 w-4" />
                    View FAQs
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction("announcements")}
                    className="gap-2"
                  >
                    <Megaphone className="h-4 w-4" />
                    Latest Announcements
                  </Button>
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
