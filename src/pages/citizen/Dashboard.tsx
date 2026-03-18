import { useEffect, useState } from "react";
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
  AlertTriangle,
  FileText,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMyComplaints, type Complaint } from "@/lib/api";

const CitizenDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyComplaints({ page: 1, page_size: 100 });
      setComplaints(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to load reports",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Compute stats from live data
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const verifiedCount = complaints.filter((c) => c.status === "verified").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-primary/10 text-primary border-primary/20";
      case "verified":
        return "bg-warning/10 text-warning border-warning/20";
      case "resolved":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "verified":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return null;
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/citizen/profile")}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{verifiedCount}</p>
                <p className="text-sm text-muted-foreground">Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </Card>
        </div>

        {/* My Reports */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">My Reports</h2>
            <Button variant="outline" onClick={fetchComplaints} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your reports...</p>
            </div>
          ) : error ? (
            <Card className="p-8 text-center space-y-4">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchComplaints}>Try Again</Button>
            </Card>
          ) : complaints.length === 0 ? (
            <Card className="p-12 text-center space-y-4 border-2 border-dashed">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-xl font-semibold">No reports yet</h3>
              <p className="text-muted-foreground">
                You haven't submitted any reports. Click "New Report" to get
                started.
              </p>
              <Button onClick={() => navigate("/citizen/report")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Report
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="p-6 hover:shadow-lg transition-all border-2 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    {/* Image thumbnail or icon */}
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {complaint.image_url ? (
                        <img
                          src={complaint.image_url}
                          alt={complaint.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).parentElement!.innerHTML =
                              '<svg class="h-6 w-6 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>';
                          }}
                        />
                      ) : (
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">
                            {complaint.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {complaint.description}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 items-end flex-shrink-0">
                          <Badge
                            className={`${getStatusColor(
                              complaint.status
                            )} border flex items-center gap-1`}
                          >
                            {getStatusIcon(complaint.status)}
                            {complaint.status}
                          </Badge>
                          <Badge
                            className={`${getPriorityColor(
                              complaint.priority
                            )} border text-xs`}
                          >
                            {complaint.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDate(complaint.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {complaint.latitude.toFixed(4)},{" "}
                          {complaint.longitude.toFixed(4)}
                        </span>
                        {complaint.image_url && (
                          <span className="flex items-center gap-1 text-primary">
                            <ImageIcon className="h-3.5 w-3.5" />
                            Has photo
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
