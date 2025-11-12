import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { MessageSquare, Zap, Clock, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/chat");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                ClarifyAI
              </span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Your intelligent campus assistant providing instant answers to all your queries about facilities, events, academics, and more.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="bg-gradient-primary text-lg shadow-lg transition-transform hover:scale-105"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">24/7 Availability</h3>
            <p className="text-muted-foreground">
              Get answers to your questions anytime, anywhere. No waiting, no schedules.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Instant Answers</h3>
            <p className="text-muted-foreground">
              Powered by advanced AI to provide accurate information in seconds.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Smart Conversations</h3>
            <p className="text-muted-foreground">
              Natural language understanding for intuitive and helpful interactions.
            </p>
          </div>

          <div className="rounded-xl bg-card p-6 shadow-md transition-shadow hover:shadow-lg">
            <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your conversations are protected with enterprise-grade security.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="rounded-2xl bg-gradient-primary p-12 text-center shadow-xl">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to explore your campus?
          </h2>
          <p className="mb-8 text-lg text-white/90">
            Join thousands of students using our AI assistant every day
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/auth")}
            className="text-lg shadow-lg"
          >
            Start Chatting Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
