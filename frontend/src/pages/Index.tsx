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
          <div className="text-xl font-bold text-black">ClarifyAI</div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/auth")}
              className="text-[#007AFF] font-normal text-[17px] hover:text-[#0051D5] hover:bg-[rgba(0,122,255,0.08)] px-6 py-2 rounded-full transition-all duration-200"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-3 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Viewport */}
      <div className="min-h-screen flex flex-col justify-center items-center px-8 md:px-16">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-[clamp(48px,8vw,80px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-6">
            Your campus. Simplified.
          </h1>
          <p className="text-[clamp(21px,3vw,28px)] font-normal text-[#6e6e73] leading-[1.4] mb-10">
            Instant answers about facilities, events, and academics.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/auth")}
              className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-3.5 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate("/auth")}
              className="text-[#007AFF] font-normal text-[17px] px-8 py-3.5 hover:text-[#0051D5] hover:bg-[rgba(0,122,255,0.08)] rounded-full transition-all duration-200"
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
