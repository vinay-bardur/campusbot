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
          <div className="flex items-center gap-8">
            <span className="text-[#007AFF] font-normal text-[17px]">Home</span>
            <button 
              onClick={() => navigate("/about")}
              className="text-[#1d1d1f] font-normal text-[17px] hover:text-[#007AFF] transition-colors duration-200"
            >
              About
            </button>
            <button 
              onClick={() => navigate("/contact")}
              className="text-[#1d1d1f] font-normal text-[17px] hover:text-[#007AFF] transition-colors duration-200"
            >
              Contact
            </button>
            {user ? (
              <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-sm font-medium">
                {user.email?.[0]?.toUpperCase()}
              </div>
            ) : (
              <button 
                onClick={() => navigate("/auth")}
                className="text-[#007AFF] font-normal text-[17px] hover:text-[#0051D5] transition-colors duration-200"
              >
                Sign In
              </button>
            )}
          </div>
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

      {/* Features Section */}
      <div className="py-24 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[40px] font-semibold text-[#1d1d1f] mb-4">Everything you need to know</h2>
            <p className="text-[19px] text-[#6e6e73] max-w-2xl mx-auto">
              From course fees to faculty contacts, get instant answers about KLE BCA
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 rounded-full bg-[#007AFF]"></div>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-3">Instant Answers</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.5]">
                Get immediate responses about admissions, fees, faculty, and facilities
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 rounded-full bg-[#007AFF]"></div>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-3">Always Current</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.5]">
                Information updated by college staff to ensure accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#007AFF]/10 flex items-center justify-center mx-auto mb-6">
                <div className="w-8 h-8 rounded-full bg-[#007AFF]"></div>
              </div>
              <h3 className="text-[20px] font-semibold text-[#1d1d1f] mb-3">Natural Conversation</h3>
              <p className="text-[17px] text-[#6e6e73] leading-[1.5]">
                Ask questions in your own words, just like talking to a friend
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Section */}
      <div className="py-24 px-8 md:px-16 bg-[#f5f5f7]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[40px] font-semibold text-[#1d1d1f] mb-12">Quick Info</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-4">Course Details</h3>
              <div className="space-y-3 text-left">
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">Duration:</strong> 3 years (6 semesters)</p>
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">Fees:</strong> ₹1,00,000 per year</p>
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">Affiliation:</strong> Karnataka University, Hubli</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-8">
              <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-4">Key Contacts</h3>
              <div className="space-y-3 text-left">
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">Coordinator:</strong> Mr. Siddalingappa Kadakol</p>
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">IT Support:</strong> Mr. Mahesh Rao Koppal</p>
                <p className="text-[17px] text-[#6e6e73]"><strong className="text-[#1d1d1f]">Location:</strong> P.C. Jabin Science College, Hubli</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-8 md:px-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[40px] font-semibold text-[#1d1d1f] mb-6">Ready to get started?</h2>
          <p className="text-[19px] text-[#6e6e73] mb-12">
            Join hundreds of KLE BCA students who use ClarifyAI every day
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-12 py-4 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Start Chatting Now
          </button>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <footer className="border-t border-[#d2d2d7] py-8">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <p className="text-[15px] text-[#86868b]">
            © 2025 Built by Vinay G B
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
