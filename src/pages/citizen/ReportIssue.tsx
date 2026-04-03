import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, MapPin, Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createComplaint, type Priority } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Reverse-geocode lat/lng to a human-readable address using OpenStreetMap Nominatim. */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Geocoding failed");
    const data = await res.json();
    return data.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}

/** Forward-geocode a text location to lat/lng using OpenStreetMap Nominatim. */
async function forwardGeocode(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

const ReportIssue = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Display-friendly location text (address / place name)
  const [locationDisplay, setLocationDisplay] = useState("");
  // Raw coordinates for backend submission
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file",
          description: "Please select an image file (JPG, PNG, etc.)",
          variant: "destructive",
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Image must be smaller than 10MB.",
          variant: "destructive",
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });

        // Reverse-geocode to get a readable address
        const address = await reverseGeocode(latitude, longitude);
        setLocationDisplay(address);
        setDetectingLocation(false);

        toast({
          title: "Location detected",
          description: address,
        });
      },
      () => {
        setDetectingLocation(false);
        toast({
          title: "Location unavailable",
          description: "Could not detect location. Enter manually.",
          variant: "destructive",
        });
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please provide a title for the issue.",
        variant: "destructive",
      });
      return;
    }

    if (!locationDisplay.trim()) {
      toast({
        title: "Missing location",
        description: "Please provide a location for the issue.",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Not authenticated",
        description: "Please log in to submit a report.",
        variant: "destructive",
      });
      navigate("/citizen/login");
      return;
    }

    setLoading(true);

    try {
      let latitude: number;
      let longitude: number;

      if (coords) {
        // Use the stored GPS coordinates
        latitude = coords.latitude;
        longitude = coords.longitude;
      } else {
        // User typed a location name manually — try to forward-geocode it
        const result = await forwardGeocode(locationDisplay);
        if (result) {
          latitude = result.lat;
          longitude = result.lng;
        } else {
          // Fallback: check if the user typed raw coordinates
          const latLngMatch = locationDisplay.match(
            /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/
          );
          if (latLngMatch) {
            latitude = parseFloat(latLngMatch[1]);
            longitude = parseFloat(latLngMatch[2]);
          } else {
            toast({
              title: "Invalid location",
              description:
                "Could not resolve the location. Please use the GPS button or enter a valid address.",
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
        }
      }

      await createComplaint({
        title: formData.title,
        description: formData.description,
        latitude,
        longitude,
        priority: formData.priority,
        image: imageFile,
      });

      toast({
        title: "Issue Reported!",
        description: "Your complaint has been submitted successfully.",
      });
      navigate("/citizen/dashboard");
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief title for the issue"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="h-12"
              />
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Upload Photo</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border-2 border-primary/30">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    {imageFile?.name}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {/* Hidden file inputs */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 flex-col gap-2 border-2 border-dashed hover:border-primary transition-all"
                    onClick={() => cameraInputRef.current?.click()}
                  >
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm">Take Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-32 flex-col gap-2 border-2 border-dashed hover:border-primary transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm">Upload Photo</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter location name or use GPS"
                  value={locationDisplay}
                  onChange={(e) => {
                    setLocationDisplay(e.target.value);
                    // Clear stored coords when user manually edits the location
                    setCoords(null);
                  }}
                  required
                  className="h-12"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 shrink-0"
                  disabled={detectingLocation}
                  onClick={handleDetectLocation}
                >
                  {detectingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Type an address or click the pin icon to auto-detect your
                location
              </p>
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
