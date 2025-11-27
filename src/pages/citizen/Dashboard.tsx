import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  User,
  LogOut,
  Construction,
  Zap,
  Trash2,
  AlertTriangle,
} from "lucide-react";

const CitizenDashboard = () => {
  const navigate = useNavigate();

  const recentIssues = [
    {
      id: 1,
      title: "Pothole on Main Street",
      category: "Road",
      status: "in-progress",
      date: "2024-01-20",
      icon: Construction,
    },
    {
      id: 2,
      title: "Broken Street Light",
      category: "Electricity",
      status: "submitted",
      date: "2024-01-22",
      icon: Zap,
    },
    {
      id: 3,
      title: "Garbage Collection Missed",
      category: "Garbage",
      status: "resolved",
      date: "2024-01-15",
      icon: Trash2,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-primary/10 text-primary border-primary/20";
      case "in-progress":
        return "bg-warning/10 text-warning border-warning/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
    }
  };

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
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Quick Actions */}
        <div className="mb-8">
          <Card className="p-8 bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Report an Issue</h2>
                <p className="text-primary-foreground/90">
                  See something that needs fixing? Report it now.
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 shadow-lg"
                onClick={() => navigate("/citizen/report")}
              >
                <Plus className="mr-2 h-5 w-5" />
                New Report
              </Button>
            </div>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">5</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">24h</p>
                <p className="text-sm text-muted-foreground">Avg Response</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Issues */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Reports</h2>
            <Button variant="outline" onClick={() => navigate("/citizen/complaints")}>
              View All
            </Button>
          </div>

          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <Card
                key={issue.id}
                className="p-6 hover:shadow-lg transition-all border-2 cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <issue.icon className="h-6 w-6 text-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{issue.title}</h3>
                        <p className="text-sm text-muted-foreground">{issue.category}</p>
                      </div>
                      <Badge className={`${getStatusColor(issue.status)} border flex items-center gap-1`}>
                        {getStatusIcon(issue.status)}
                        {issue.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Reported on {issue.date}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
