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
    AlertCircle,
    Clock,
    CheckCircle2,
    FileText,
    Loader2,
    AlertTriangle,
    ImageIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { getMe, getMyComplaints, type UserResponse, type Complaint } from "@/lib/api";

const CitizenProfile = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [totalComplaints, setTotalComplaints] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const [userData, complaintsData] = await Promise.all([
                getMe(),
                getMyComplaints({ page: 1, page_size: 5 }),
            ]);

            setUser(userData);
            setComplaints(complaintsData.items);
            setTotalComplaints(complaintsData.total);
        } catch (err: any) {
            setError(err.message || "Failed to load profile");
            toast({
                title: "Profile cannot be fetched",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center">
                <Card className="p-8 max-w-md w-full text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <h2 className="text-xl font-semibold">Failed to load profile</h2>
                    <p className="text-muted-foreground">{error || "An unknown error occurred"}</p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={fetchProfile}>Try Again</Button>
                        <Button variant="outline" onClick={() => navigate("/citizen/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();

    // Stats from real data
    const pendingCount = complaints.filter((c) => c.status === "pending").length;
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
                return <Clock className="h-3 w-3" />;
            case "verified":
                return <AlertCircle className="h-3 w-3" />;
            case "resolved":
                return <CheckCircle2 className="h-3 w-3" />;
            default:
                return null;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div 
                        className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        onClick={() => navigate("/")}
                    >
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
                        <Button variant="ghost" size="icon" className="text-primary">
                            <User className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
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
                            <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                                <Badge className="capitalize bg-primary/10 text-primary border-primary/20 border">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {user.role}
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {totalComplaints} {totalComplaints === 1 ? "Report" : "Reports"}
                                </Badge>
                            </div>
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

                {/* Recent Reports */}
                <Card className="p-6 mb-6 border-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            Recent Reports
                        </h3>
                        {totalComplaints > 5 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/citizen/dashboard")}
                            >
                                View All
                            </Button>
                        )}
                    </div>
                    <Separator className="mb-4" />
                    {complaints.length === 0 ? (
                        <div className="text-center py-6 space-y-2">
                            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-muted-foreground text-sm">No reports submitted yet</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate("/citizen/report")}
                            >
                                Submit Your First Report
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {complaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {complaint.image_url ? (
                                            <img
                                                src={complaint.image_url}
                                                alt=""
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                }}
                                            />
                                        ) : (
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">
                                            {complaint.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(complaint.created_at)}
                                            {complaint.image_url && (
                                                <span className="flex items-center gap-0.5 text-primary">
                                                    <ImageIcon className="h-3 w-3" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        className={`${getStatusColor(complaint.status)} border text-xs flex items-center gap-1`}
                                    >
                                        {getStatusIcon(complaint.status)}
                                        {complaint.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
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
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default CitizenProfile;
