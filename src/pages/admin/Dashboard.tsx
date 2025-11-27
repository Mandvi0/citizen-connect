import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const recentIssues = [
    {
      id: 1,
      title: "Pothole on Main Street",
      citizen: "John Doe",
      category: "Road",
      status: "submitted",
      priority: "high",
    },
    {
      id: 2,
      title: "Broken Street Light",
      citizen: "Jane Smith",
      category: "Electricity",
      status: "in-progress",
      priority: "medium",
    },
    {
      id: 3,
      title: "Garbage Collection Missed",
      citizen: "Mike Johnson",
      category: "Garbage",
      status: "in-progress",
      priority: "low",
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="font-bold">Admin Portal</h1>
              <p className="text-xs text-muted-foreground">CivicConnect</p>
            </div>
          </div>

          <nav className="space-y-2">
            <Button variant="default" className="w-full justify-start">
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <MapPin className="mr-3 h-5 w-5" />
              Map View
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <AlertTriangle className="mr-3 h-5 w-5" />
              All Issues
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="mr-3 h-5 w-5" />
              Departments
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="mr-3 h-5 w-5" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </Button>
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => navigate("/")}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor and manage civic issues</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-primary" />
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold mb-1">248</p>
            <p className="text-sm text-muted-foreground">Total Issues</p>
            <p className="text-xs text-success mt-2">+12% from last month</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">42</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">68</p>
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-xs text-muted-foreground mt-2">Being resolved</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold mb-1">138</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
            <p className="text-xs text-success mt-2">+8% resolution rate</p>
          </Card>
        </div>

        {/* Recent Issues */}
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Issues</h2>
            <Button variant="outline">View All</Button>
          </div>

          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <Card key={issue.id} className="p-4 border hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">{issue.title}</h3>
                      <Badge className={`${getPriorityColor(issue.priority)} border text-xs`}>
                        {issue.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>👤 {issue.citizen}</span>
                      <span>📍 {issue.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(issue.status)} border`}>
                      {issue.status}
                    </Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
