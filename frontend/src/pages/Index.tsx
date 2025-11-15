import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  return (
    <div className="h-full bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="px-8 md:px-16 py-4 flex items-center justify-between">
          <div className="text-[20px] font-bold text-[#1d1d1f]">ClarifyAI</div>
          {user && (
            <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-sm font-medium">
              {user.email?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Full Viewport */}
      <div className="min-h-screen flex flex-col justify-center items-center px-8 md:px-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-[clamp(48px,8vw,80px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-6">
            Ask anything.<br />Get answers instantly.
          </h1>
          <p className="text-[clamp(21px,3vw,28px)] font-normal text-[#6e6e73] leading-[1.4] mb-12">
            Your intelligent assistant for KLE BCA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 mt-15">
            <button
              onClick={() => navigate("/auth")}
              className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-10 py-4 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate("/auth")}
              className="text-[#007AFF] font-normal text-[17px] px-10 py-4 hover:text-[#0051D5] hover:bg-[rgba(0,122,255,0.08)] rounded-full transition-all duration-200"
            >
              Sign In
            </button>
          </div>
          <p className="text-[15px] text-[#86868b] text-center mt-[60px]">
            Available 24/7. Powered by AI. Secure by design.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
