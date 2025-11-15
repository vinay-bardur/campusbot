import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="px-8 md:px-16 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="text-[20px] font-bold text-[#1d1d1f] hover:text-[#007AFF] transition-colors"
          >
            ClarifyAI
          </button>
          <div className="flex items-center gap-8">
            <button 
              onClick={() => navigate("/")}
              className="text-[#1d1d1f] font-normal text-[17px] hover:text-[#007AFF] transition-colors duration-200"
            >
              Home
            </button>
            <span className="text-[#007AFF] font-normal text-[17px]">About</span>
            <button 
              onClick={() => navigate("/contact")}
              className="text-[#1d1d1f] font-normal text-[17px] hover:text-[#007AFF] transition-colors duration-200"
            >
              Contact
            </button>
            <button 
              onClick={() => navigate("/auth")}
              className="text-[#007AFF] font-normal text-[17px] hover:text-[#0051D5] transition-colors duration-200"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="pt-24 px-8 md:px-16 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-[clamp(48px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-8 text-center">
            Built for Students,<br />By Students
          </h1>

          <div className="space-y-16">
            {/* Our Mission */}
            <section className="max-w-3xl mx-auto">
              <h2 className="text-[32px] font-semibold text-[#1d1d1f] mb-6">Our Mission</h2>
              <p className="text-[19px] text-[#6e6e73] leading-[1.5]">
                ClarifyAI was created to solve a simple problem: finding campus information shouldn't be hard. 
                We built an AI assistant that gives you instant, accurate answers about KLE BCA—no more hunting 
                through websites or waiting for office hours.
              </p>
            </section>

            {/* Why We Built This */}
            <section className="max-w-3xl mx-auto">
              <h2 className="text-[32px] font-semibold text-[#1d1d1f] mb-6">Why We Built This</h2>
              <p className="text-[19px] text-[#6e6e73] leading-[1.5]">
                As BCA students, we experienced the frustration of scattered information firsthand. Important details 
                buried in emails, outdated PDFs, conflicting announcements—we knew there had to be a better way. 
                ClarifyAI puts all campus knowledge in one place, accessible 24/7 through natural conversation.
              </p>
            </section>

            {/* How It Helps */}
            <section className="max-w-3xl mx-auto">
              <h2 className="text-[32px] font-semibold text-[#1d1d1f] mb-6">How It Helps</h2>
              <ul className="space-y-4">
                {[
                  "Instant answers about fees, faculty, facilities, and academics",
                  "Available 24/7—no waiting for office hours",
                  "Natural language understanding—ask questions your way",
                  "Always up-to-date information managed by staff",
                  "Saves time for both students and administrators"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#007AFF] mt-3 flex-shrink-0"></div>
                    <span className="text-[19px] text-[#6e6e73] leading-[1.5]">{benefit}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Official Website */}
            <section className="max-w-3xl mx-auto text-center">
              <h2 className="text-[32px] font-semibold text-[#1d1d1f] mb-6">Official College Website</h2>
              <p className="text-[19px] text-[#6e6e73] leading-[1.5] mb-8">
                For official announcements, detailed syllabus, and administrative forms, visit:
              </p>
              <a 
                href="https://www.klebcahubli.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-4 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Visit KLE BCA Official Website
              </a>
            </section>
          </div>
        </div>
      </div>
      
      {/* Copyright Footer */}
      <footer className="border-t border-[#d2d2d7] py-8">
        <div className="max-w-4xl mx-auto px-8 text-center">
          <p className="text-[15px] text-[#86868b]">
            © 2025 Built by Vinay G B
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;