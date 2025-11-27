import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Users, BarChart3, Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZTBmMmZlIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
        
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-primary/20">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Trusted by 50,000+ Citizens</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent leading-tight">
              Report. Track. Resolve.
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Your voice matters. Report civic issues instantly and watch your community transform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary/90 hover:shadow-lg transition-all"
                onClick={() => navigate('/citizen/login')}
              >
                <Users className="mr-2 h-5 w-5" />
                Report an Issue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:bg-primary/5 transition-all"
                onClick={() => navigate('/admin/login')}
              >
                <Shield className="mr-2 h-5 w-5" />
                Admin Portal
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
            <Card className="p-6 text-center hover:shadow-lg transition-all border-2 bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-primary mb-2">12,543</div>
              <div className="text-muted-foreground">Issues Resolved</div>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all border-2 bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-accent mb-2">24hrs</div>
              <div className="text-muted-foreground">Avg Response Time</div>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-all border-2 bg-card/50 backdrop-blur-sm">
              <div className="text-4xl font-bold text-warning mb-2">95%</div>
              <div className="text-muted-foreground">Satisfaction Rate</div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Simple, fast, and effective</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-primary/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-6 shadow-lg">
                <MapPin className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Report</h3>
              <p className="text-muted-foreground">
                Take a photo, add location, and describe the issue. It takes less than a minute.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-accent/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center mb-6 shadow-lg">
                <BarChart3 className="h-8 w-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Track</h3>
              <p className="text-muted-foreground">
                Monitor your complaint status in real-time from submission to resolution.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all border-2 hover:border-success/50">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success to-success/80 flex items-center justify-center mb-6 shadow-lg">
                <Shield className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Resolve</h3>
              <p className="text-muted-foreground">
                Get notified when your issue is resolved. Rate the service and help improve.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of citizens working together to build a better community.
          </p>
          <Button 
            size="lg"
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all"
            onClick={() => navigate('/citizen/signup')}
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
