import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MessageSquarePlus, 
  MessageSquare, 
  LogOut, 
  User as UserIcon,
  Shield,
  Menu,
  X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

interface ChatSidebarProps {
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const ChatSidebar = ({ 
  currentConversationId, 
  onNewChat, 
  onSelectConversation,
  isMobileOpen,
  onMobileClose 
}: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const sidebarContent = (
    <>
      <div className="p-6">
        <Button
          onClick={() => {
            onNewChat();
            onMobileClose();
          }}
          className="w-full justify-start gap-3 bg-[#007AFF] hover:bg-[#0056CC] text-white py-3 rounded-[8px] font-medium"
        >
          <MessageSquarePlus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-6">
        <div className="space-y-1 py-4">
          <h3 className="mb-4 text-[13px] font-medium text-[#6e6e73] uppercase tracking-wide">Recent Chats</h3>
          {conversations.map((conv) => (
            <Button
              key={conv.id}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 py-3 px-3 rounded-[8px] text-[15px] font-normal hover:bg-[#f5f5f7]",
                currentConversationId === conv.id && "bg-[#f5f5f7] text-[#007AFF]"
              )}
              onClick={() => {
                onSelectConversation(conv.id);
                onMobileClose();
              }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="truncate">{conv.title}</span>
            </Button>
          ))}
          {conversations.length === 0 && (
            <p className="text-center text-[15px] text-[#86868b] py-8">
              No conversations yet
            </p>
          )}
        </div>
      </ScrollArea>

      <Separator />

      <div className="space-y-2 p-6">
        {isAdmin && (
          <button
            className="w-full flex items-center justify-start gap-3 py-3 px-3 rounded-[8px] text-[15px] font-normal text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.05)] transition-colors duration-200"
            onClick={() => {
              navigate("/admin");
              onMobileClose();
            }}
          >
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </button>
        )}
        <button
          className="w-full flex items-center justify-start gap-3 py-3 px-3 rounded-[8px] text-[15px] font-normal text-[#1d1d1f] hover:bg-[rgba(0,0,0,0.05)] transition-colors duration-200"
          onClick={() => {
            navigate("/profile");
            onMobileClose();
          }}
        >
          <UserIcon className="h-4 w-4" />
          Profile
        </button>
        <button
          className="w-full flex items-center justify-start gap-3 py-3 px-3 rounded-[8px] text-[15px] font-normal text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] hover:text-[#dc2626] transition-colors duration-200"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-[#d2d2d7] bg-white shadow-lg transition-transform duration-300 md:relative md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Mobile Close Button */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <h2 className="text-lg font-semibold">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {sidebarContent}
      </aside>
    </>
  );
};

export const ChatSidebarTrigger = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className="md:hidden"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};
