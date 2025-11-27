import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Upload, Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReportIssue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      toast({
        title: "Issue Reported!",
        description: "Your complaint has been submitted successfully.",
      });
      navigate("/citizen/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/citizen/dashboard")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Report an Issue</h1>
          <p className="text-muted-foreground">Help us improve your community</p>
        </div>

        <Card className="p-8 shadow-xl border-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Upload Photo</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex-col gap-2 border-2 border-dashed hover:border-primary transition-all"
                >
                  <Camera className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm">Take Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-32 flex-col gap-2 border-2 border-dashed hover:border-primary transition-all"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm">Upload Photo</span>
                </Button>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road & Infrastructure</SelectItem>
                  <SelectItem value="traffic">Traffic Issues</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="garbage">Garbage Collection</SelectItem>
                  <SelectItem value="water">Water Supply</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter location or use current location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                  className="h-12"
                />
                <Button type="button" variant="outline" size="icon" className="h-12 w-12">
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                rows={6}
                className="resize-none"
              />
              <Button type="button" variant="ghost" size="sm" className="mt-2">
                <Mic className="mr-2 h-4 w-4" />
                Add Voice Note
              </Button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/90"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ReportIssue;
