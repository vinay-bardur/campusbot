import { useNavigate } from "react-router-dom";
import { Mail, Linkedin, Instagram, ExternalLink } from "lucide-react";

const Contact = () => {
  const navigate = useNavigate();

  const developers = [
    {
      name: "Vinay G B",
      role: "Vibe Coder",
      email: "vinaybardur20@gmail.com",
      linkedin: "https://www.linkedin.com/in/vinay-bardur/",
      instagram: "https://www.instagram.com/wealthy_vinaygb/"
    },
    {
      name: "Deepak M",
      role: "Frontend Developer", 
      email: "deepak.m@example.com",
      linkedin: "https://www.linkedin.com/in/deepak-m",
      instagram: "https://instagram.com/deepak.m"
    }
  ];

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
            <button 
              onClick={() => navigate("/about")}
              className="text-[#1d1d1f] font-normal text-[17px] hover:text-[#007AFF] transition-colors duration-200"
            >
              About
            </button>
            <span className="text-[#007AFF] font-normal text-[17px]">Contact</span>
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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-[clamp(48px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.02em] text-[#1d1d1f] mb-6 text-center">
            Get in Touch
          </h1>
          <p className="text-[24px] text-[#6e6e73] text-center mb-16 max-w-2xl mx-auto">
            Have questions, suggestions, or feedback about ClarifyAI?
          </p>

          {/* Developers */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            {developers.map((dev, index) => (
              <div key={index} className="text-center">
                <div className="w-24 h-24 rounded-full bg-[#007AFF] flex items-center justify-center text-white text-[32px] font-bold mx-auto mb-6">
                  {dev.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-[24px] font-semibold text-[#1d1d1f] mb-2">{dev.name}</h3>
                <p className="text-[17px] text-[#6e6e73] mb-6">{dev.role}</p>
                
                <div className="flex justify-center gap-4">
                  <a 
                    href={`mailto:${dev.email}`}
                    className="w-12 h-12 rounded-full bg-[#f5f5f7] hover:bg-[#007AFF] flex items-center justify-center transition-colors duration-200 group"
                  >
                    <Mail className="h-5 w-5 text-[#6e6e73] group-hover:text-white" />
                  </a>
                  <a 
                    href={dev.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#f5f5f7] hover:bg-[#007AFF] flex items-center justify-center transition-colors duration-200 group"
                  >
                    <Linkedin className="h-5 w-5 text-[#6e6e73] group-hover:text-white" />
                  </a>
                  <a 
                    href={dev.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-[#f5f5f7] hover:bg-[#007AFF] flex items-center justify-center transition-colors duration-200 group"
                  >
                    <Instagram className="h-5 w-5 text-[#6e6e73] group-hover:text-white" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* College Contact */}
          <div className="max-w-3xl mx-auto text-center border-t border-[#d2d2d7] pt-16">
            <h2 className="text-[32px] font-semibold text-[#1d1d1f] mb-8">KLE BCA Department</h2>
            <div className="space-y-4 mb-8">
              <p className="text-[19px] text-[#6e6e73]">
                <strong className="text-[#1d1d1f]">Coordinator:</strong> Mr. Siddalingappa Kadakol
              </p>
              <p className="text-[19px] text-[#6e6e73]">
                <strong className="text-[#1d1d1f]">IT Support:</strong> Mr. Mahesh Rao Koppal
              </p>
              <p className="text-[19px] text-[#6e6e73]">
                <strong className="text-[#1d1d1f]">Location:</strong> P. C. Jabin Science College, Hubli, Karnataka
              </p>
            </div>
            <a 
              href="https://www.klebcahubli.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-4 rounded-full text-[17px] font-medium transition-all duration-200 hover:shadow-[0_8px_16px_rgba(0,122,255,0.3)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Visit College Website
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
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

export default Contact;