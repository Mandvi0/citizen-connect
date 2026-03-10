import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Bell,
  User,
  LogOut,
  Mail,
  Shield,
  Hash,
  ArrowLeft,
  Settings,
  Globe,
  Pencil,
} from "lucide-react";

// TODO: Replace with actual API call to auth/me endpoint
const mockUser = {
  name: "harsh",
  email: "harshmishra9933@gmail.com",
  id: 1,
  role: "user",
};

const CitizenProfile = () => {
  const navigate = useNavigate();
  const user = mockUser;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">CivicConnect</h1>
              <p className="text-xs text-muted-foreground">Citizen Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Button variant="ghost" size="icon" className="text-primary">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/citizen/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Profile Header Card */}
        <Card className="p-8 mb-6 border-2">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 text-2xl">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold capitalize">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <Badge className="mt-2 capitalize bg-primary/10 text-primary border-primary/20 border">
                <Shield className="h-3 w-3 mr-1" />
                {user.role}
              </Badge>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-6 mb-6 border-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </h3>
          <Separator className="mb-4" />
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-medium">{user.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium capitalize">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Settings */}
        <Card className="p-6 mb-6 border-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </h3>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Language</p>
                <p className="text-sm text-muted-foreground">English</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={() => navigate("/")}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default CitizenProfile;
