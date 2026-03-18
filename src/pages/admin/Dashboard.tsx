import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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
  Loader2,
  RefreshCw,
  ImageIcon,
  Eye,
  CheckCheck,
} from "lucide-react";
import {
  listAllComplaints,
  updateComplaintStatus,
  resolveComplaint,
  type Complaint,
  type ComplaintStatus,
  type Priority,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/admin/login");
        return;
      }

      const params: {
        page: number;
        page_size: number;
        status?: ComplaintStatus;
        priority?: Priority;
      } = {
        page,
        page_size: 20,
      };

      if (filterStatus !== "all")
        params.status = filterStatus as ComplaintStatus;
      if (filterPriority !== "all")
        params.priority = filterPriority as Priority;

      const data = await listAllComplaints(params);
      setComplaints(data.items);
      setTotal(data.total);
      setTotalPages(data.pages);
    } catch (err: any) {
      toast({
        title: "Failed to load complaints",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, filterStatus, filterPriority]);

  const handleStatusChange = async (
    complaintId: number,
    newStatus: ComplaintStatus
  ) => {
    setActionLoading(complaintId);
    try {
      if (newStatus === "resolved") {
        await resolveComplaint(complaintId);
      } else {
        await updateComplaintStatus(complaintId, { status: newStatus });
      }
      toast({
        title: "Status Updated",
        description: `Complaint #${complaintId} marked as ${newStatus}.`,
      });
      fetchComplaints();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePriorityChange = async (
    complaintId: number,
    newPriority: Priority
  ) => {
    setActionLoading(complaintId);
    try {
      await updateComplaintStatus(complaintId, { priority: newPriority });
      toast({
        title: "Priority Updated",
        description: `Complaint #${complaintId} priority set to ${newPriority}.`,
      });
      fetchComplaints();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Computed stats
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const verifiedCount = complaints.filter(
    (c) => c.status === "verified"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
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
              onClick={handleLogout}
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
            <p className="text-muted-foreground">
              Monitor and manage civic issues
            </p>
          </div>
          <Button
            variant="outline"
            onClick={fetchComplaints}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
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
            <p className="text-3xl font-bold mb-1">{total}</p>
            <p className="text-sm text-muted-foreground">Total Issues</p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
            <p className="text-xs text-muted-foreground mt-2">
              Requires attention
            </p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-warning" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{verifiedCount}</p>
            <p className="text-sm text-muted-foreground">Verified</p>
            <p className="text-xs text-muted-foreground mt-2">
              Being resolved
            </p>
          </Card>

          <Card className="p-6 border-2 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <p className="text-3xl font-bold mb-1">{resolvedCount}</p>
            <p className="text-sm text-muted-foreground">Resolved</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Status:
            </span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Priority:
            </span>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Complaints List */}
        <Card className="p-6 border-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              All Complaints{" "}
              <span className="text-muted-foreground text-lg font-normal">
                ({total})
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-semibold">No complaints found</h3>
              <p className="text-muted-foreground">
                {filterStatus !== "all" || filterPriority !== "all"
                  ? "Try adjusting your filters."
                  : "No complaints have been submitted yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card
                  key={complaint.id}
                  className="p-4 border hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Image thumbnail */}
                    {complaint.image_url && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                        <img
                          src={complaint.image_url}
                          alt={complaint.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{complaint.title}</h3>
                        <Badge
                          className={`${getPriorityColor(
                            complaint.priority
                          )} border text-xs`}
                        >
                          {complaint.priority}
                        </Badge>
                        <Badge
                          className={`${getStatusColor(
                            complaint.status
                          )} border text-xs`}
                        >
                          {complaint.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {complaint.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          👤 User #{complaint.user_id}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {complaint.latitude.toFixed(4)},{" "}
                          {complaint.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(complaint.created_at)}
                        </span>
                        {complaint.image_url && (
                          <span className="flex items-center gap-1 text-primary">
                            <ImageIcon className="h-3 w-3" />
                            Photo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {complaint.status !== "verified" &&
                        complaint.status !== "resolved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-warning border-warning/30 hover:bg-warning/10"
                            disabled={actionLoading === complaint.id}
                            onClick={() =>
                              handleStatusChange(complaint.id, "verified")
                            }
                          >
                            {actionLoading === complaint.id ? (
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                              <Eye className="h-3 w-3 mr-1" />
                            )}
                            Verify
                          </Button>
                        )}
                      {complaint.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-success border-success/30 hover:bg-success/10"
                          disabled={actionLoading === complaint.id}
                          onClick={() =>
                            handleStatusChange(complaint.id, "resolved")
                          }
                        >
                          {actionLoading === complaint.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <CheckCheck className="h-3 w-3 mr-1" />
                          )}
                          Resolve
                        </Button>
                      )}
                      {complaint.status === "resolved" && (
                        <Badge className="bg-success/10 text-success border-success/20 border">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
