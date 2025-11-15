import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, Mail, Shield, MessageSquare } from "lucide-react";

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-10">
      <div className="container mx-auto max-w-4xl py-16">
        <div className="mb-16 flex items-center justify-between">
          <h1 className="text-[48px] font-semibold text-[#1d1d1f]">Profile</h1>
          <button 
            onClick={() => navigate("/chat")}
            className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-3 rounded-full text-[16px] font-medium transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Back to Chat
          </button>
        </div>

        <div className="grid gap-12 md:grid-cols-2">
          <Card className="border-[#d2d2d7] shadow-none">
            <CardHeader className="pb-8">
              <CardTitle className="text-[24px] font-semibold text-[#1d1d1f] flex items-center gap-3">
                <User className="h-6 w-6" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-8 pb-8">
              <div>
                <p className="text-[14px] font-medium text-[#6e6e73] mb-2">Email</p>
                <p className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                  <Mail className="h-4 w-4" />
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-[14px] font-medium text-[#6e6e73] mb-2">Role</p>
                <p className="flex items-center gap-3 text-[16px] text-[#1d1d1f]">
                  <Shield className="h-4 w-4" />
                  {isAdmin ? "Administrator" : "User"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#d2d2d7] shadow-none">
            <CardHeader className="pb-8">
              <CardTitle className="text-[24px] font-semibold text-[#1d1d1f] flex items-center gap-3">
                <MessageSquare className="h-6 w-6" />
                Chat History
              </CardTitle>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <p className="text-[16px] text-[#6e6e73] mb-6">
                View your conversations
              </p>
              <button
                onClick={() => navigate("/chat")}
                className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-6 py-3 rounded-[8px] text-[16px] font-medium transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Go to Chat
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
