import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Loader2,
  FileText,
  Calendar,
  User,
  Trash2,
  CheckCheck,
  Eye,
  AlertTriangle,
} from "lucide-react";
import {
  getComplaint,
  updateComplaintStatus,
  resolveComplaint,
  deleteComplaint,
  type Complaint,
  type ComplaintStatus,
  type Priority,
} from "@/lib/api";
import LiveMap from "@/components/LiveMap";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminComplaintDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchComplaint = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getComplaint(parseInt(id));
      setComplaint(data);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Failed to load complaint",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleStatusChange = async (newStatus: ComplaintStatus) => {
    if (!id) return;
    setActionLoading(true);
    try {
      if (newStatus === "resolved") {
        await resolveComplaint(parseInt(id));
      } else {
        await updateComplaintStatus(parseInt(id), { status: newStatus });
      }
      toast({
        title: "Status Updated",
        description: `Complaint status changed to ${newStatus}.`,
      });
      fetchComplaint();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await updateComplaintStatus(parseInt(id), { priority: newPriority });
      toast({
        title: "Priority Updated",
        description: `Complaint priority changed to ${newPriority}.`,
      });
      fetchComplaint();
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      await deleteComplaint(parseInt(id));
      toast({
        title: "Complaint Deleted",
        description: "The complaint has been deleted successfully.",
      });
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setDeleteDialogOpen(false);
    }
  };

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
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
        <Card className="p-8 text-center space-y-4 max-w-md">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Failed to load complaint</h2>
          <p className="text-muted-foreground">{error || "Complaint not found"}</p>
          <Button onClick={() => navigate("/admin/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-lg z-50">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-bold text-sm">Complaint Details</h1>
              <p className="text-xs text-muted-foreground">ID #{complaint.id}</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="max-w-4xl">
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{complaint.title}</h2>
                <div className="flex items-center gap-3">
                  <Badge className={`${getStatusColor(complaint.status)} border flex items-center gap-1`}>
                    {getStatusIcon(complaint.status)}
                    {complaint.status}
                  </Badge>
                  <Badge className={`${getPriorityColor(complaint.priority)} border`}>
                    {complaint.priority}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">{complaint.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>User ID: #{complaint.user_id}</span>
              </div>
              <div className="col-span-2 mt-2 mb-2">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Incident Location (<span className="text-xs font-normal text-muted-foreground">{complaint.latitude.toFixed(6)}, {complaint.longitude.toFixed(6)}</span>)
                </h4>
                <div className="h-48 w-full rounded-xl overflow-hidden border">
                  <LiveMap 
                    complaints={[complaint]} 
                    center={[complaint.latitude, complaint.longitude]} 
                    zoom={15} 
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created: {formatDate(complaint.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated: {formatDate(complaint.updated_at)}</span>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {complaint.image_url && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Evidence Photo
                  </h3>
                  <div className="rounded-lg overflow-hidden bg-muted">
                    <img
                      src={complaint.image_url}
                      alt="Complaint evidence"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </Card>
              )}

              {!complaint.image_url && (
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Evidence Photo
                  </h3>
                  <div className="rounded-lg border-2 border-dashed bg-muted/50 flex flex-col items-center justify-center py-12">
                    <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground text-sm">No photo uploaded</p>
                  </div>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Status</label>
                    <Select
                      value={complaint.status}
                      onValueChange={(val) => handleStatusChange(val as ComplaintStatus)}
                      disabled={actionLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-primary" />
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="verified">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-warning" />
                            Verified
                          </div>
                        </SelectItem>
                        <SelectItem value="resolved">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Resolved
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-2 block">Priority</label>
                    <Select
                      value={complaint.priority}
                      onValueChange={(val) => handlePriorityChange(val as Priority)}
                      disabled={actionLoading}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-success" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-destructive" />
                            High
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    {complaint.status !== "verified" && complaint.status !== "resolved" && (
                      <Button
                        variant="outline"
                        className="w-full text-warning border-warning/30 hover:bg-warning/10"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange("verified")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Mark as Verified
                      </Button>
                    )}
                    {complaint.status !== "resolved" && (
                      <Button
                        variant="outline"
                        className="w-full text-success border-success/30 hover:bg-success/10"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange("resolved")}
                      >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full mt-4"
                      disabled={actionLoading}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Complaint
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-destructive" />
                        Delete Complaint
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete complaint <strong>#{complaint.id}</strong>? 
                        This action cannot be undone and will permanently remove the complaint from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Status Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      "bg-primary text-primary-foreground"
                    }`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Pending</p>
                      <p className="text-xs text-muted-foreground">Complaint submitted</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      complaint.status === "verified" || complaint.status === "resolved" 
                        ? "bg-warning text-warning-foreground" : "bg-muted"
                    }`}>
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Verified</p>
                      <p className="text-xs text-muted-foreground">
                        {complaint.status === "verified" || complaint.status === "resolved" 
                          ? "Verified by admin" : "Awaiting verification"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      complaint.status === "resolved" ? "bg-success text-success-foreground" : "bg-muted"
                    }`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">Resolved</p>
                      <p className="text-xs text-muted-foreground">
                        {complaint.status === "resolved" ? "Issue resolved" : "Pending resolution"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminComplaintDetail;
