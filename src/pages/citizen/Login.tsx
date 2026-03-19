import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { MapPin, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { login, getMe } from "@/lib/api";

const CitizenLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);

      // Check role for correct routing
      const user = await getMe();
      localStorage.setItem("role", user.role);
      
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/citizen/dashboard");
      }
    } catch (err: any) {
      toast({
        title: "Login failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="p-8 shadow-xl border-2">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 mb-4 shadow-lg">
              <MapPin className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Citizen Login</h1>
            <p className="text-muted-foreground">Report and track civic issues</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/90"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => navigate("/citizen/signup")}
              >
                Sign up
              </Button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CitizenLogin;
