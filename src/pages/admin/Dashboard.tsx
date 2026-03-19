import { useEffect, useState, useMemo } from "react";
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
  Shield,
  Mail,
  Moon,
  Sun,
  Bell,
  Globe,
  Search,
} from "lucide-react";
import {
  listAllComplaints,
  updateComplaintStatus,
  resolveComplaint,
  getMe,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import LiveMap from "@/components/LiveMap";

type AdminTab = "dashboard" | "map" | "issues" | "departments" | "analytics" | "settings";

// Department categories derived from complaint data
const DEPARTMENTS = [
  { name: "Roads & Infrastructure", keywords: ["road", "pothole", "bridge", "crack", "pavement", "highway", "street"], icon: "🛣️", color: "bg-orange-500" },
  { name: "Water & Sanitation", keywords: ["water", "drain", "sewage", "pipe", "flood", "leak", "sanitation"], icon: "💧", color: "bg-blue-500" },
  { name: "Electricity", keywords: ["electric", "power", "light", "wire", "pole", "outage", "lamp"], icon: "⚡", color: "bg-yellow-500" },
  { name: "Waste Management", keywords: ["waste", "garbage", "trash", "dump", "bin", "litter", "clean"], icon: "🗑️", color: "bg-green-500" },
  { name: "Public Safety", keywords: ["safety", "danger", "accident", "crime", "broken", "damage", "hazard"], icon: "🛡️", color: "bg-red-500" },
  { name: "Parks & Environment", keywords: ["park", "tree", "garden", "environment", "green", "pollution"], icon: "🌳", color: "bg-emerald-500" },
  { name: "General / Other", keywords: [], icon: "📋", color: "bg-slate-500" },
];

function classifyDepartment(complaint: Complaint): string {
  const text = `${complaint.title} ${complaint.description}`.toLowerCase();
  for (const dept of DEPARTMENTS) {
    if (dept.keywords.some(kw => text.includes(kw))) return dept.name;
  }
  return "General / Other";
}

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
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // Settings state
  const [adminName, setAdminName] = useState("Admin");
  const [adminEmail, setAdminEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

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
        page_size: 100, // Fetch more for analytics/map
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

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const user = await getMe();
        setAdminName(user.name);
        setAdminEmail(user.email);
      } catch {
        // ignore
      }
    };
    fetchAdmin();
  }, []);

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

  // Computed stats
  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const verifiedCount = complaints.filter((c) => c.status === "verified").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const highPriorityCount = complaints.filter((c) => c.priority === "high").length;
  const mediumPriorityCount = complaints.filter((c) => c.priority === "medium").length;
  const lowPriorityCount = complaints.filter((c) => c.priority === "low").length;

  // Department stats
  const departmentStats = useMemo(() => {
    const stats: Record<string, { total: number; pending: number; verified: number; resolved: number }> = {};
    DEPARTMENTS.forEach(d => {
      stats[d.name] = { total: 0, pending: 0, verified: 0, resolved: 0 };
    });
    complaints.forEach(c => {
      const dept = classifyDepartment(c);
      if (!stats[dept]) stats[dept] = { total: 0, pending: 0, verified: 0, resolved: 0 };
      stats[dept].total++;
      stats[dept][c.status]++;
    });
    return stats;
  }, [complaints]);

  // Search filtered complaints
  const filteredComplaints = useMemo(() => {
    if (!searchQuery.trim()) return complaints;
    const q = searchQuery.toLowerCase();
    return complaints.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      String(c.id).includes(q)
    );
  }, [complaints, searchQuery]);

  // Map center
  const mapCenter = useMemo<[number, number]>(() => {
    if (complaints.length === 0) return [28.6139, 77.209];
    const avgLat = complaints.reduce((s, c) => s + c.latitude, 0) / complaints.length;
    const avgLng = complaints.reduce((s, c) => s + c.longitude, 0) / complaints.length;
    return [avgLat, avgLng];
  }, [complaints]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-primary/10 text-primary border-primary/20";
      case "verified": return "bg-warning/10 text-warning border-warning/20";
      case "resolved": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "low": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
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
    localStorage.removeItem("role");
    navigate("/");
  };

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="mr-3 h-5 w-5" /> },
    { id: "map", label: "Map View", icon: <MapPin className="mr-3 h-5 w-5" /> },
    { id: "issues", label: "All Issues", icon: <AlertTriangle className="mr-3 h-5 w-5" /> },
    { id: "departments", label: "Departments", icon: <Users className="mr-3 h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="mr-3 h-5 w-5" /> },
    { id: "settings", label: "Settings", icon: <Settings className="mr-3 h-5 w-5" /> },
  ];

  // ─── Render Tab Content ────────────────────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "map":
        return renderMapView();
      case "issues":
        return renderAllIssues();
      case "departments":
        return renderDepartments();
      case "analytics":
        return renderAnalytics();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  // ─── Dashboard Tab ─────────────────────────────────────────────────
  const renderDashboard = () => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-muted-foreground">Monitor and manage civic issues</p>
        </div>
        <Button variant="outline" onClick={fetchComplaints} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => setActiveTab("issues")}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="text-3xl font-bold mb-1">{total}</p>
          <p className="text-sm text-muted-foreground">Total Issues</p>
        </Card>

        <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setFilterStatus("pending"); setActiveTab("issues"); }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
        </Card>

        <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setFilterStatus("verified"); setActiveTab("issues"); }}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-warning" />
            </div>
          </div>
          <p className="text-3xl font-bold mb-1">{verifiedCount}</p>
          <p className="text-sm text-muted-foreground">Verified</p>
          <p className="text-xs text-muted-foreground mt-2">Being resolved</p>
        </Card>

        <Card className="p-6 border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => { setFilterStatus("resolved"); setActiveTab("issues"); }}>
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

      {/* Recent Complaints */}
      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Complaints</h2>
          <Button variant="link" onClick={() => setActiveTab("issues")}>View All →</Button>
        </div>
        {renderComplaintList(complaints.slice(0, 5))}
      </Card>
    </>
  );

  // ─── Map View Tab ──────────────────────────────────────────────────
  const renderMapView = () => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Map View</h1>
          <p className="text-muted-foreground">Geographic overview of all reported issues</p>
        </div>
        <Button variant="outline" onClick={fetchComplaints} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Map Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-semibold">{pendingCount} Pending</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-sm font-semibold">{verifiedCount} Verified</span>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-sm font-semibold">{resolvedCount} Resolved</span>
        </Card>
      </div>

      <Card className="border-2 overflow-hidden" style={{ height: "calc(100vh - 320px)" }}>
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <LiveMap
            complaints={complaints}
            center={mapCenter}
            zoom={12}
            onMarkerClick={(c) => navigate(`/admin/complaints/${c.id}`)}
          />
        )}
      </Card>
    </>
  );

  // ─── All Issues Tab ────────────────────────────────────────────────
  const renderAllIssues = () => (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">All Issues</h1>
          <p className="text-muted-foreground">Complete list of all reported issues</p>
        </div>
        <Button variant="outline" onClick={fetchComplaints} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search issues by title, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Status:</span>
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
          <span className="text-sm font-medium text-muted-foreground">Priority:</span>
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

      <Card className="p-6 border-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            Complaints <span className="text-muted-foreground text-lg font-normal">({filteredComplaints.length})</span>
          </h2>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading complaints...</p>
          </div>
        ) : (
          renderComplaintList(filteredComplaints)
        )}

        {totalPages > 1 && !searchQuery && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>
    </>
  );

  // ─── Departments Tab ───────────────────────────────────────────────
  const renderDepartments = () => (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Departments</h1>
        <p className="text-muted-foreground">Issues categorized by department responsibility</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEPARTMENTS.map((dept) => {
          const stats = departmentStats[dept.name] || { total: 0, pending: 0, verified: 0, resolved: 0 };
          const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

          return (
            <Card key={dept.name} className="p-6 border-2 hover:shadow-lg transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl ${dept.color} flex items-center justify-center text-2xl shadow-lg`}>
                  {dept.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{stats.total} total issues</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-muted-foreground">Resolution Rate</span>
                  <span className={resolutionRate > 70 ? "text-success" : resolutionRate > 40 ? "text-warning" : "text-destructive"}>
                    {resolutionRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${resolutionRate > 70 ? "bg-success" : resolutionRate > 40 ? "bg-warning" : "bg-destructive"}`}
                    style={{ width: `${resolutionRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t">
                <div>
                  <p className="text-lg font-bold text-primary">{stats.pending}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Pending</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-warning">{stats.verified}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Verified</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">{stats.resolved}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase">Resolved</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );

  // ─── Analytics Tab ─────────────────────────────────────────────────
  const renderAnalytics = () => {
    const totalComplaints = complaints.length;
    const resolvedPct = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;
    const pendingPct = totalComplaints > 0 ? Math.round((pendingCount / totalComplaints) * 100) : 0;
    const verifiedPct = totalComplaints > 0 ? Math.round((verifiedCount / totalComplaints) * 100) : 0;

    // Complaints per day (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().slice(0, 10);
    });

    const perDay = last7Days.map(date => ({
      date,
      label: new Date(date).toLocaleDateString("en-IN", { weekday: "short" }),
      count: complaints.filter(c => c.created_at.slice(0, 10) === date).length,
    }));

    const maxPerDay = Math.max(...perDay.map(d => d.count), 1);

    return (
      <>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">Insights and trends from issue data</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Resolution Rate</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-success">{resolvedPct}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 mt-4 overflow-hidden">
              <div className="h-3 rounded-full bg-success transition-all duration-700" style={{ width: `${resolvedPct}%` }} />
            </div>
          </Card>
          <Card className="p-6 border-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Avg. Response</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-primary">
                {totalComplaints > 0 ? "24h" : "—"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">Average time to first action</p>
          </Card>
          <Card className="p-6 border-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">High Priority</p>
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black text-destructive">{highPriorityCount}</span>
              <span className="text-sm font-semibold text-muted-foreground mb-2">/ {totalComplaints}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{totalComplaints > 0 ? Math.round((highPriorityCount / totalComplaints) * 100) : 0}% of all issues are high priority</p>
          </Card>
        </div>

        {/* Status Breakdown + Priority Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border-2">
            <h3 className="font-bold text-lg mb-6">Status Breakdown</h3>
            <div className="space-y-5">
              {[
                { label: "Pending", count: pendingCount, pct: pendingPct, color: "bg-primary" },
                { label: "Verified", count: verifiedCount, pct: verifiedPct, color: "bg-warning" },
                { label: "Resolved", count: resolvedCount, pct: resolvedPct, color: "bg-success" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span>{item.label}</span>
                    <span>{item.count} ({item.pct}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                    <div className={`h-3 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-2">
            <h3 className="font-bold text-lg mb-6">Priority Distribution</h3>
            <div className="space-y-5">
              {[
                { label: "High", count: highPriorityCount, color: "bg-destructive" },
                { label: "Medium", count: mediumPriorityCount, color: "bg-warning" },
                { label: "Low", count: lowPriorityCount, color: "bg-success" },
              ].map(item => {
                const pct = totalComplaints > 0 ? Math.round((item.count / totalComplaints) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm font-semibold mb-1">
                      <span>{item.label}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div className={`h-3 rounded-full ${item.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Activity Chart (last 7 days) */}
        <Card className="p-6 border-2">
          <h3 className="font-bold text-lg mb-6">Complaints (Last 7 Days)</h3>
          <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
            {perDay.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">{day.count}</span>
                <div
                  className="w-full bg-primary/80 rounded-t-lg transition-all duration-500 hover:bg-primary min-h-[4px]"
                  style={{ height: `${(day.count / maxPerDay) * 140}px` }}
                />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">{day.label}</span>
              </div>
            ))}
          </div>
        </Card>
      </>
    );
  };

  // ─── Settings Tab ──────────────────────────────────────────────────
  const renderSettings = () => (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your admin account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <Card className="p-6 border-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Profile
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Display Name</Label>
              <Input id="admin-name" value={adminName} onChange={(e) => setAdminName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input id="admin-email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} disabled className="bg-muted" />
              </div>
            </div>
            <Button className="mt-4"
              onClick={() => toast({ title: "Profile Saved", description: "Your profile has been updated." })}>
              Save Profile
            </Button>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 border-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Preferences
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-warning" />}
                <div>
                  <p className="font-semibold text-sm">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified about new issues</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold text-sm">Language</p>
                  <p className="text-xs text-muted-foreground">Interface language</p>
                </div>
              </div>
              <Select defaultValue="en">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-2 border-destructive/30 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">Sign Out</p>
              <p className="text-xs text-muted-foreground">Log out of your admin session</p>
            </div>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </Card>
      </div>
    </>
  );

  // ─── Reusable complaint list renderer ──────────────────────────────
  const renderComplaintList = (list: Complaint[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-12 space-y-3">
          <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-semibold">No complaints found</h3>
          <p className="text-muted-foreground">
            {filterStatus !== "all" || filterPriority !== "all" || searchQuery
              ? "Try adjusting your filters or search."
              : "No complaints have been submitted yet."}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {list.map((complaint) => (
          <Card
            key={complaint.id}
            className="p-4 border hover:shadow-md transition-all cursor-pointer"
            onClick={() => navigate(`/admin/complaints/${complaint.id}`)}
          >
            <div className="flex items-start gap-4">
              {complaint.image_url && (
                <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={complaint.image_url}
                    alt={complaint.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{complaint.title}</h3>
                  <Badge className={`${getPriorityColor(complaint.priority)} border text-xs`}>
                    {complaint.priority}
                  </Badge>
                  <Badge className={`${getStatusColor(complaint.status)} border text-xs`}>
                    {complaint.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {complaint.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>👤 User #{complaint.user_id}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {complaint.latitude.toFixed(4)}, {complaint.longitude.toFixed(4)}
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
              <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                {complaint.status !== "verified" && complaint.status !== "resolved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-warning border-warning/30 hover:bg-warning/10"
                    disabled={actionLoading === complaint.id}
                    onClick={() => handleStatusChange(complaint.id, "verified")}
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
                    onClick={() => handleStatusChange(complaint.id, "resolved")}
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
    );
  };

  // ═══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg z-50">
        <div className="p-6">
          <div
            className="flex items-center gap-3 mb-8 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            onClick={() => navigate("/")}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-destructive to-destructive/80 flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-destructive-foreground" />
            </div>
            <div>
              <h1 className="font-bold">Admin Portal</h1>
              <p className="text-xs text-muted-foreground">CivicConnect</p>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
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
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
