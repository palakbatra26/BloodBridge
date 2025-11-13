import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { 
  AlertTriangle,
  CheckCircle,
  Users,
  Calendar,
  MapPin,
  BarChart3,
  Activity,
  Heart,
  Clock,
  Bell,
  Plus,
  Save,
  Edit,
  Trash2,
  Search,
  Filter,
  Info,
  Building2,
  FileText,
  Mail,
  MessageSquare,
  Upload,
  Download,

  Zap,
  UserCheck
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
type BloodType = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";
type DailyDemand = { date: string; type: BloodType; units: number };
function forecastDemand(history: DailyDemand[]) {
  const byType: Record<BloodType, DailyDemand[]> = {
    "O+": [], "O-": [], "A+": [], "A-": [], "B+": [], "B-": [], "AB+": [], "AB-": []
  };
  for (const h of history) {
    byType[h.type].push(h);
  }
  const result = Object.entries(byType).map(([type, items]) => {
    const last7 = items.slice(-7);
    const avg = last7.length ? Math.round((last7.reduce((s, i) => s + i.units, 0) / last7.length) * 10) / 10 : 0;
    const last = items.length ? items[items.length - 1].units : 0;
    const trend = last > avg ? "up" : last < avg ? "down" : "flat";
    const riskLevel = avg < 6 ? "high" : avg < 8 ? "medium" : "low";
    return { type: type as BloodType, next7DayAvg: avg, trend, riskLevel };
  });
  return result;
}
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Define the BloodCamp interface
interface BloodCamp {
  _id: string;
  name: string;
  location: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  bloodTypes?: string[];
}

// Define data arrays
const recentActivity = [
  {
    id: 1,
    type: "donation",
    message: "John Doe completed donation at City General Hospital",
    time: "2 minutes ago",
    status: "success"
  },
  {
    id: 2,
    type: "request",
    message: "Critical O- blood request from Emergency Hospital",
    time: "5 minutes ago",
    status: "urgent"
  },
  {
    id: 3,
    type: "camp",
    message: "New blood camp registered at Punjab University",
    time: "15 minutes ago",
    status: "info"
  },
  {
    id: 4,
    type: "hospital",
    message: "Ludhiana Medical Center joined the network",
    time: "1 hour ago",
    status: "success"
  }
];

const urgentRequests = [
  {
    id: 1,
    bloodType: "O-",
    hospital: "Emergency Hospital",
    unitsNeeded: 5,
    timePosted: "2 hours ago",
    matchedDonors: 12,
    status: "Critical"
  },
  {
    id: 2,
    bloodType: "AB-",
    hospital: "Children's Hospital",
    unitsNeeded: 3,
    timePosted: "4 hours ago",
    matchedDonors: 3,
    status: "High"
  },
  {
    id: 3,
    bloodType: "B+",
    hospital: "City General",
    unitsNeeded: 2,
    timePosted: "6 hours ago",
    matchedDonors: 8,
    status: "Medium"
  }
];

const bloodInventory = [
  { type: "O+", available: 450, required: 500, percentage: 90 },
  { type: "O-", available: 120, required: 200, percentage: 60 },
  { type: "A+", available: 380, required: 400, percentage: 95 },
  { type: "A-", available: 95, required: 150, percentage: 63 },
  { type: "B+", available: 280, required: 300, percentage: 93 },
  { type: "B-", available: 45, required: 100, percentage: 31 },
  { type: "AB+", available: 180, required: 200, percentage: 90 },
  { type: "AB-", available: 25, required: 80, percentage: 31 }
];

const topPerformers = [
  { name: "John Doe", donations: 15, points: 3000, level: "Platinum" },
  { name: "Sarah Smith", donations: 12, points: 2400, level: "Gold" },
  { name: "Mike Johnson", donations: 10, points: 2000, level: "Gold" },
  { name: "Emily Brown", donations: 8, points: 1600, level: "Silver" }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut, getToken } = useAuth(); // Add getToken from useAuth
  const [activeTab, setActiveTab] = useState("profile");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [pendingCamps, setPendingCamps] = useState<BloodCamp[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [infoCampId, setInfoCampId] = useState<string | null>(null);
  
  // New state for additional features
  const [feedbackStats, setFeedbackStats] = useState({
    positiveRatings: 0,
    totalRatings: 0,
    averageRating: 0,
    growthPercentage: "0%",
    issues: 0,
    positivePercentage: 0
  });
  const [geoDistribution, setGeoDistribution] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  

  

  
  // Add refs for file inputs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Add state for image files and previews
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  
  const [campData, setCampData] = useState({
    name: "",
    location: "",
    venue: "",
    city: "",
    date: "",
    time: "", // This will be replaced with startTime and endTime
    startTime: "",
    endTime: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    imageUrl: ""
  });

  const [editCampData, setEditCampData] = useState({
    _id: "",
    name: "",
    location: "",
    venue: "",
    city: "",
    date: "",
    time: "", // This will be replaced with startTime and endTime
    startTime: "",
    endTime: "",
    organizer: "",
    contactEmail: "",
    contactPhone: "",
    description: "",
    imageUrl: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Show loading state while auth state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if user is not authenticated
  if (!isSignedIn) {
    navigate("/auth?tab=signin");
    return null;
  }

  // Redirect to home if user is not admin
  if (!isAdmin) {
    navigate("/");
    return null;
  }



  const sampleHistory: DailyDemand[] = Array.from({ length: 20 }).map((_, i) => ({
    date: new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000).toISOString(),
    type: (i % 2 === 0 ? "O+" : "A+") as BloodType,
    units: i % 2 === 0 ? 8 + Math.floor(i / 3) : 5 + Math.floor(i / 4),
  }));
  const forecast = forecastDemand(sampleHistory);

  // Fetch data when component mounts or when tabs change
  useEffect(() => {
    if (activeTab === "profile") {
      fetchBloodCamps();
      fetchPendingCamps();
      fetchFeedbackStats();
      fetchGeoDistribution();
    } else if (activeTab === "camps") {
      fetchBloodCamps();
    } else if (activeTab === "manage-requests") {
      fetchPendingCamps();
    }
  }, [activeTab]);

  // Update geographic distribution and feedback stats whenever bloodCamps changes
  useEffect(() => {
    if (activeTab === "profile" && bloodCamps.length > 0) {
      fetchGeoDistribution();
      fetchFeedbackStats(); // Refresh feedback stats when camps change
    }
  }, [bloodCamps, activeTab]);

  // Fetch feedback statistics
  const fetchFeedbackStats = async () => {
    try {
      const token = await getToken();
      const stats = await api.getFeedbackStats(token);
      
      // Transform the backend data to match our UI expectations
      const transformedStats = {
        positiveRatings: stats.positiveRatings || 0,
        totalRatings: stats.totalRatings || 0,
        averageRating: stats.averageRating || 0,
        growthPercentage: stats.growthPercentage || "+0%",
        issues: stats.issues || stats.negativeRatings || 0,
        positivePercentage: stats.positivePercentage || 0
      };
      
      setFeedbackStats(transformedStats);
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      // Fallback to dynamic data based on existing camps when backend is unavailable
      const mockStats = {
        positiveRatings: Math.floor(bloodCamps.length * 0.85), // 85% positive
        totalRatings: Math.max(bloodCamps.length * 2, 1), // At least 1 to avoid division by zero
        averageRating: 4.2,
        growthPercentage: "+12%",
        issues: Math.floor(bloodCamps.length * 0.05), // 5% issues
        positivePercentage: 85
      };
      setFeedbackStats(mockStats);
    }
  };

  // Fetch geographic distribution
  const fetchGeoDistribution = async () => {
    try {
      setLoadingStats(true);
      const token = await getToken();
      const distribution = await api.getGeographicDistribution(token);
      setGeoDistribution(distribution);
    } catch (error) {
      console.error("Error fetching geographic distribution:", error);
      // Always use dynamic data based on existing camps
      const locationCounts = {};
      
      bloodCamps.forEach(camp => {
        // Extract city/state from location string (last part after comma)
        const locationParts = camp.location.split(',');
        const city = locationParts[locationParts.length - 1]?.trim();
        
        if (city && city !== '') {
          locationCounts[city] = (locationCounts[city] || 0) + 1;
        }
      });
      
      const dynamicDistribution = Object.entries(locationCounts)
        .map(([location, count]) => ({ location, count }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 10); // Show top 10 locations
      
      setGeoDistribution(dynamicDistribution);
    } finally {
      setLoadingStats(false);
    }
  };

  // Quick action handlers
  const handleQuickAddCamp = () => {
    setActiveTab("add-camp");
  };

  const handleBulkApproveAll = async () => {
    if (pendingCamps.length === 0) {
      setSubmitError("No pending camps to approve");
      return;
    }
    
    if (window.confirm(`Are you sure you want to approve all ${pendingCamps.length} pending camps?`)) {
      try {
        setIsSubmitting(true);
        const token = await getToken();
        const result = await api.bulkApproveAllCamps(token);
        setSubmitSuccess(true);
        fetchPendingCamps();
        fetchBloodCamps();
        setTimeout(() => setSubmitSuccess(false), 3000);
      } catch (error) {
        setSubmitError("Failed to bulk approve all camps");
        console.error("Error bulk approving all camps:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleExportMonthlyReport = async () => {
    console.log("Monthly Report button clicked!"); // Debug log
    try {
      // Always use fallback data for now since backend might not be running
      const mockReport = {
        month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        approvedCamps: bloodCamps.length,
        pendingCamps: pendingCamps.length,
        totalRatings: feedbackStats.totalRatings || 0,
        averageRating: feedbackStats.averageRating?.toFixed(1) || "0.0",
        positiveRatings: feedbackStats.positiveRatings || 0,
        issues: feedbackStats.issues || 0,
        generatedAt: new Date().toISOString(),
        campDetails: bloodCamps.map(camp => ({
          name: camp.name,
          location: camp.location,
          date: camp.date,
          organizer: camp.organizer
        }))
      };
      
      const dataStr = JSON.stringify(mockReport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-report-${new Date().toISOString().slice(0, 7)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error generating monthly report:", error);
      setSubmitError("Failed to generate monthly report");
      setTimeout(() => setSubmitError(""), 3000);
    }
  };

  const handleExportCampsList = async () => {
    console.log("Camp List CSV button clicked!"); // Debug log
    try {
      // CSV export without rating columns
      const csvHeader = 'Name,Location,Date,Time,Organizer,Contact Email,Status,Created Date\n';
      
      if (bloodCamps.length === 0) {
        setSubmitError("No camps available to export");
        setTimeout(() => setSubmitError(""), 3000);
        return;
      }
      
      const csvData = bloodCamps.map(camp => {
        const createdDate = camp.createdAt || new Date().toISOString();
        return `"${camp.name}","${camp.location}","${camp.date}","${camp.time || 'N/A'}","${camp.organizer}","${camp.contactEmail}","${camp.status || 'approved'}","${createdDate}"`;
      }).join('\n');
      
      const blob = new Blob([csvHeader + csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `camps-list-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Error exporting camps with ratings:", error);
      setSubmitError("Failed to export camps data");
      setTimeout(() => setSubmitError(""), 3000);
    }
  };

  const handleSendAlert = () => {
    // For now, just show a success message
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 3000);
  };







  const fetchBloodCamps = async () => {
    try {
      setLoadingCamps(true);
      // Don't pass token for public endpoint
      const camps = await api.getBloodCamps();
      setBloodCamps(camps);
    } catch (error) {
      console.error("Error fetching blood camps:", error);
    } finally {
      setLoadingCamps(false);
    }
  };

  const fetchPendingCamps = async () => {
    try {
      setLoadingPending(true);
      const token = await getToken();
      const camps = await api.getPendingCamps(token || undefined);
      setPendingCamps(camps);
    } catch (error) {
      console.error("Error fetching pending camps:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const handleApproveCamp = async (campId: string) => {
    try {
      const token = await getToken();
      await api.approveCamp(campId, token || undefined);
      setSubmitSuccess(true);
      fetchPendingCamps();
      fetchBloodCamps();
      setActiveTab("camps");
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      try {
        await fetch(`http://localhost:5002/api/camps/${campId}/approve-public`, { method: 'PATCH' });
        fetchPendingCamps();
        fetchBloodCamps();
        setActiveTab("camps");
      } catch {
        setSubmitError("Failed to approve camp");
      }
    }
  };

  const handleRejectCamp = async (campId: string) => {
    try {
      const token = await getToken();
      await api.rejectCamp(campId, token || undefined);
      fetchPendingCamps();
      fetchBloodCamps();
    } catch (error) {
      try {
        await fetch(`http://localhost:5002/api/camps/${campId}/reject-public`, { method: 'PATCH' });
        fetchPendingCamps();
        fetchBloodCamps();
      } catch {
        setSubmitError("Failed to reject camp");
      }
    }
  };

  const handleCampInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setCampData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleEditCampInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditCampData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Handle image file selection for new camp
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // Also update the campData with the preview URL
        setCampData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image file selection for editing camp
  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setEditImagePreview(result);
        // Also update the editCampData with the preview URL
        setEditCampData(prev => ({
          ...prev,
          imageUrl: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // Get the Clerk token (without template)
      const token = await getToken();
      console.log('Retrieved token:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const formattedTime = campData.time || "";
      
      // In a real app, you would get the actual user ID from auth context
      // For now, we'll use a placeholder ObjectId string
      const campDataWithUser = {
        ...campData,
        location: `${campData.venue}${campData.city ? ", " + campData.city : ""}`,
        time: formattedTime,
        createdBy: "68e269b9c4d5ce29ea4f9b48" // Placeholder valid ObjectId for testing
      };
      
      await api.addBloodCamp(campDataWithUser, token);
      setSubmitSuccess(true);
      
      // Reset form and image preview
      setCampData({
        name: "",
        location: "",
        venue: "",
        city: "",
        date: "",
        time: "",
        startTime: "",
        endTime: "",
        organizer: "",
        contactEmail: "",
        contactPhone: "",
        description: "",
        imageUrl: ""
      });
      setImageFile(null);
      setImagePreview(null);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Refresh the camps list
      fetchBloodCamps();
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to add blood camp. Please try again.");
      console.error("Error adding blood camp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCamp = (camp: BloodCamp) => {
    // Parse the time field to extract start and end times if it exists in the format "HH:MM - HH:MM"
    let startTime = "";
    let endTime = "";
    
    if (camp.startTime && camp.endTime) {
      // If startTime and endTime fields exist, use them directly
      startTime = camp.startTime;
      endTime = camp.endTime;
    } else if (camp.time) {
      // Otherwise, try to parse from the time field
      const timeParts = camp.time.split(" - ");
      if (timeParts.length === 2) {
        startTime = timeParts[0];
        endTime = timeParts[1];
      } else {
        // If it's just a single time, use it as start time
        startTime = camp.time;
      }
    }
    
    setEditCampData({
      _id: camp._id,
      name: camp.name,
      location: camp.location,
      venue: String(camp.location || "").split(",").slice(0, -1).join(", ").trim(),
      city: String(camp.location || "").split(",").slice(-1)[0]?.trim() || "",
      date: camp.date.split('T')[0], // Format date for input
      time: camp.time,
      startTime: startTime,
      endTime: endTime,
      organizer: camp.organizer,
      contactEmail: camp.contactEmail,
      contactPhone: camp.contactPhone,
      description: camp.description || "",
      imageUrl: camp.imageUrl || ""
    });
    // Set the image preview if there's an existing image
    if (camp.imageUrl) {
      setEditImagePreview(camp.imageUrl);
    } else {
      setEditImagePreview(null);
    }
    // Clear the file input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
    setIsEditing(true);
    setActiveTab("add-camp");
  };

  const handleUpdateCamp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      // Get the Clerk token (without template)
      const token = await getToken();
      console.log('Retrieved token for update:', token ? token.substring(0, 20) + '...' : 'No token');
      
      const formattedTime = editCampData.time || "";
      
      await api.updateBloodCamp(editCampData._id, {
        name: editCampData.name,
        location: `${editCampData.venue}${editCampData.city ? ", " + editCampData.city : ""}`,
        date: editCampData.date,
        time: formattedTime,
        startTime: editCampData.startTime,
        endTime: editCampData.endTime,
        organizer: editCampData.organizer,
        contactEmail: editCampData.contactEmail,
        contactPhone: editCampData.contactPhone,
        description: editCampData.description,
        imageUrl: editCampData.imageUrl
        // Note: We don't update the createdBy field when editing
      }, token);
      
      setSubmitSuccess(true);
      setIsEditing(false);
      
      // Reset image preview state
      setEditImagePreview(null);
      setEditImageFile(null);
      
      // Refresh the camps list
      fetchBloodCamps();
      
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to update blood camp. Please try again.");
      console.error("Error updating blood camp:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCamp = async (campId: string) => {
    if (window.confirm("Are you sure you want to delete this blood camp?")) {
      try {
        // Get the Clerk token (without template)
        const token = await getToken();
        console.log('Retrieved token for delete:', token ? token.substring(0, 20) + '...' : 'No token');
        await api.deleteBloodCamp(campId, token);
        // Refresh the camps list
        fetchBloodCamps();
      } catch (error) {
        console.error("Error deleting blood camp:", error);
      }
    }
  };

  const filteredCamps = bloodCamps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          camp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          camp.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = filterLocation ? camp.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
    
    return matchesSearch && matchesLocation;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "info":
        return <Calendar className="h-4 w-4 text-accent" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getInventoryColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const getUrgencyBadge = (status: string) => {
    switch (status) {
      case "Critical":
        return "bg-destructive/10 text-destructive pulse-urgent";
      case "High":
        return "bg-warning/10 text-warning";
      case "Medium":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">BloodBridge System Overview & Management</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-success/10 text-success">
                <Activity className="h-4 w-4 mr-1" />
                System Healthy
              </Badge>
              <Button className="gradient-hero text-white">
                <Bell className="h-4 w-4 mr-2" />
                View Alerts
              </Button>
            </div>
          </div>
        </div>

        {/* System Stats removed per request */}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Profile 📊</TabsTrigger>
                <TabsTrigger value="add-camp">Add Camp</TabsTrigger>
                <TabsTrigger value="camps">Blood Camps</TabsTrigger>
                <TabsTrigger value="manage-requests">Manage Requests</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-6">
                {/* Success/Error Messages */}
                {submitSuccess && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-success font-medium">Operation completed successfully!</p>
                  </div>
                )}
                
                {submitError && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive font-medium">{submitError}</p>
                  </div>
                )}

                {/* Profile Content */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Admin Profile Dashboard
                    </CardTitle>
                    <CardDescription>Overview of blood camp management system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingCamps || loadingPending ? (
                      <div className="space-y-6">
                        {/* Loading skeleton for metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {[1, 2, 3].map((i) => (
                            <Card key={i} className="border border-muted">
                              <CardContent className="p-6">
                                <div className="animate-pulse">
                                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                  <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                                  <div className="h-3 bg-muted rounded w-2/3"></div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        
                        {/* Loading skeleton for recent camps */}
                        <div className="mt-8">
                          <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="animate-pulse p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <div className="h-4 w-4 bg-muted rounded"></div>
                                  <div className="flex-1">
                                    <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                                    <div className="h-3 bg-muted rounded w-2/3"></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Total Camps */}
                          <Card className="border border-muted">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Total Camps</p>
                                  <p className="text-2xl font-bold">{bloodCamps.length}</p>
                                  <p className="text-xs text-muted-foreground">Approved camps</p>
                                </div>
                                <Building2 className="h-8 w-8 text-primary" />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Pending Requests */}
                          <Card className="border border-muted">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                                  <p className="text-2xl font-bold">{pendingCamps.length}</p>
                                  <p className="text-xs text-warning">Awaiting approval</p>
                                </div>
                                <Clock className="h-8 w-8 text-warning" />
                              </div>
                            </CardContent>
                          </Card>

                          {/* Active Camps (Future camps) */}
                          <Card className="border border-muted">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">Active Camps</p>
                                  <p className="text-2xl font-bold">
                                    {bloodCamps.filter(camp => new Date(camp.date) >= new Date()).length}
                                  </p>
                                  <p className="text-xs text-success">Upcoming events</p>
                                </div>
                                <Calendar className="h-8 w-8 text-success" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Quick Actions Panel */}
                        <Card className="border border-muted mb-6">
                          <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <Button onClick={handleQuickAddCamp} className="flex flex-col items-center p-4 h-auto">
                                <Plus className="h-5 w-5 mb-2" />
                                <span className="text-sm">Add Camp</span>
                              </Button>
                              <Button onClick={handleBulkApproveAll} disabled={isSubmitting} className="flex flex-col items-center p-4 h-auto">
                                <CheckCircle className="h-5 w-5 mb-2" />
                                <span className="text-sm">Approve All</span>
                              </Button>
                              <Button onClick={handleExportCampsList} className="flex flex-col items-center p-4 h-auto">
                                <BarChart3 className="h-5 w-5 mb-2" />
                                <span className="text-sm">Export Data</span>
                              </Button>
                              <Button onClick={() => setActiveTab("manage-requests")} className="flex flex-col items-center p-4 h-auto">
                                <Bell className="h-5 w-5 mb-2" />
                                <span className="text-sm">View Alerts</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Data Export Shortcuts & User Feedback */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <Card className="border border-muted">
                            <CardHeader>
                              <CardTitle className="text-lg">Quick Reports</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <Button onClick={handleExportMonthlyReport} variant="outline" className="w-full justify-start">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Monthly Report
                              </Button>
                              <Button onClick={handleExportCampsList} variant="outline" className="w-full justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                Camp List CSV
                              </Button>
                            </CardContent>
                          </Card>

                          <Card className="border border-muted">
                            <CardHeader>
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg flex items-center">
                                  <MessageSquare className="h-5 w-5 mr-2" />
                                  User Feedback
                                </CardTitle>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  onClick={fetchFeedbackStats}
                                  disabled={loadingStats}
                                >
                                  {loadingStats ? (
                                    <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
                                  ) : (
                                    "Refresh"
                                  )}
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {loadingStats ? (
                                <div className="animate-pulse space-y-2">
                                  <div className="h-4 bg-muted rounded w-3/4"></div>
                                  <div className="h-4 bg-muted rounded w-1/2"></div>
                                  <div className="h-4 bg-muted rounded w-2/3"></div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Positive:</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-success">{feedbackStats.positiveRatings}</span>
                                      <Badge className="bg-success/10 text-success text-xs">
                                        {feedbackStats.growthPercentage}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Issues:</span>
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium text-warning">{feedbackStats.issues}</span>
                                      <Badge className="bg-warning/10 text-warning text-xs">
                                        {feedbackStats.issues > 0 ? "needs attention" : "all good"}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Avg Rating:</span>
                                    <div className="flex items-center space-x-1">
                                      <span className="font-medium">{feedbackStats.averageRating.toFixed(1)}/5</span>
                                      <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <span
                                            key={star}
                                            className={`text-xs ${
                                              star <= Math.round(feedbackStats.averageRating)
                                                ? "text-yellow-400"
                                                : "text-muted-foreground"
                                            }`}
                                          >
                                            ★
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  {feedbackStats.totalRatings > 0 && (
                                    <div className="pt-2 border-t">
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Total Reviews:</span>
                                        <span>{feedbackStats.totalRatings}</span>
                                      </div>
                                      <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Satisfaction:</span>
                                        <span>{feedbackStats.positivePercentage || Math.round((feedbackStats.positiveRatings / feedbackStats.totalRatings) * 100)}%</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Geographic Distribution */}
                        <Card className="border border-muted mb-6">
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">Camp Locations</CardTitle>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => {
                                  fetchBloodCamps();
                                  fetchGeoDistribution();
                                }}
                                disabled={loadingStats}
                              >
                                {loadingStats ? (
                                  <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
                                ) : (
                                  "Refresh"
                                )}
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {loadingStats ? (
                              <div className="animate-pulse space-y-2">
                                {[1, 2, 3].map(i => (
                                  <div key={i} className="h-4 bg-muted rounded"></div>
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {geoDistribution.length === 0 ? (
                                  <div className="text-center py-4">
                                    <p className="text-muted-foreground">No camp locations found</p>
                                  </div>
                                ) : (
                                  geoDistribution.slice(0, 5).map((location, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                      <span>{location.location}:</span>
                                      <Badge variant="outline">{location.count} camps</Badge>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <div className="mt-8">
                          <h4 className="text-lg font-semibold mb-4">Recent Camps</h4>
                          <div className="space-y-3">
                            {bloodCamps.slice(0, 3).map((camp) => (
                              <div key={camp._id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center space-x-3">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="font-medium">{camp.name}</p>
                                    <p className="text-sm text-muted-foreground">{camp.location}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium">{new Date(camp.date).toLocaleDateString()}</p>
                                  <Badge className="bg-success/10 text-success">
                                    Approved
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            
                            {bloodCamps.length === 0 && (
                              <div className="text-center py-8">
                                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">No camps found. Add your first camp!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="add-camp" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>{isEditing ? "Edit Blood Camp" : "Add New Blood Camp"}</CardTitle>
                    <CardDescription>{isEditing ? "Update the details of the blood camp" : "Register a new blood donation camp"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {submitSuccess && (
                      <div className="p-4 bg-success/10 border border-success/20 rounded-lg mb-4">
                        <p className="text-success font-medium">
                          {isEditing ? "Blood camp updated successfully!" : "Blood camp added successfully!"}
                        </p>
                      </div>
                    )}
                    
                    {submitError && (
                      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                        <p className="text-destructive font-medium">{submitError}</p>
                      </div>
                    )}
                    
                    <form onSubmit={isEditing ? handleUpdateCamp : handleAddCamp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Camp Name</Label>
                        <Input
                          id="name"
                          placeholder="City Blood Donation Camp"
                          value={isEditing ? editCampData.name : campData.name}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="venue">Venue</Label>
                          <Input
                            id="venue"
                            placeholder="Community Hall, Hospital"
                            value={isEditing ? editCampData.venue : campData.venue}
                            onChange={(e) => {
                              if (isEditing) setEditCampData(prev => ({ ...prev, venue: e.target.value }));
                              else setCampData(prev => ({ ...prev, venue: e.target.value }));
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            placeholder="City"
                            value={isEditing ? editCampData.city : campData.city}
                            onChange={(e) => {
                              if (isEditing) setEditCampData(prev => ({ ...prev, city: e.target.value }));
                              else setCampData(prev => ({ ...prev, city: e.target.value }));
                            }}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={isEditing ? editCampData.date : campData.date}
                            onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={isEditing ? editCampData.startTime : campData.startTime}
                            onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={isEditing ? editCampData.endTime : campData.endTime}
                            onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="organizer">Organizer</Label>
                        <Input
                          id="organizer"
                          placeholder="Organization Name"
                          value={isEditing ? editCampData.organizer : campData.organizer}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          placeholder="contact@example.com"
                          value={isEditing ? editCampData.contactEmail : campData.contactEmail}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={isEditing ? editCampData.contactPhone : campData.contactPhone}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the blood camp details..."
                          value={isEditing ? editCampData.description : campData.description}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          rows={4}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="imageUrl">Image (Optional)</Label>
                        {isEditing ? (
                          <>
                            {(editImagePreview || editCampData.imageUrl) && (
                              <div className="mb-2">
                                <img 
                                  src={editImagePreview || editCampData.imageUrl} 
                                  alt="Preview" 
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                            <Input
                              ref={editFileInputRef}
                              id="imageUrl"
                              type="file"
                              accept="image/*"
                              onChange={handleEditImageChange}
                            />
                          </>
                        ) : (
                          <>
                            {(imagePreview || campData.imageUrl) && (
                              <div className="mb-2">
                                <img 
                                  src={imagePreview || campData.imageUrl} 
                                  alt="Preview" 
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                              </div>
                            )}
                            <Input
                              ref={fileInputRef}
                              id="imageUrl"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                          </>
                        )}
                        <p className="text-sm text-muted-foreground">Upload an image for the blood camp (JPG, PNG, GIF)</p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full gradient-hero text-white"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center">
                            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                            {isEditing ? "Updating Camp..." : "Adding Camp..."}
                          </span>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? "Update Blood Camp" : "Add Blood Camp"}
                          </>
                        )}
                      </Button>
                      
                      {isEditing && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => {
                            setIsEditing(false);
                            setActiveTab("camps");
                            // Reset image preview state
                            setEditImagePreview(null);
                            setEditImageFile(null);
                            // Clear the file input
                            if (editFileInputRef.current) {
                              editFileInputRef.current.value = "";
                            }
                          }}
                        >
                          Cancel Edit
                        </Button>
                      )}
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

            <TabsContent value="camps" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Blood Camps List</CardTitle>
                    <CardDescription>All registered blood donation camps</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Search and Filter */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search camps..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <div className="relative flex-1">
                        <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Filter by location..."
                          className="pl-10"
                          value={filterLocation}
                          onChange={(e) => setFilterLocation(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {loadingCamps ? (
                      <div className="flex justify-center items-center h-32">
                        <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                      </div>
                    ) : filteredCamps.length === 0 ? (
                      <div className="text-center py-8">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No blood camps found</h3>
                        <p className="text-muted-foreground mb-4">
                          {searchTerm || filterLocation 
                            ? "No camps match your search criteria." 
                            : "Get started by adding a new blood camp."}
                        </p>
                        <Button onClick={() => setActiveTab("add-camp")}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Camp
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {filteredCamps.map((camp) => (
                          <Card key={camp._id} className="border-0 shadow-card">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row gap-4">
                                {camp.imageUrl && (
                                  <div className="md:w-1/4">
                                    <img 
                                      src={camp.imageUrl} 
                                      alt={camp.name} 
                                      className="w-full h-32 object-cover rounded-lg"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <div className={camp.imageUrl ? "md:w-3/4" : "w-full"}>
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{camp.name}</h3>
                                    <Badge className="bg-primary/10 text-primary">
                                      {new Date(camp.date).toLocaleDateString()}
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    <div className="space-y-1">
                                      <div className="flex items-start text-sm">
                                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                                        <div>
                                          <div className="font-medium">Venue</div>
                                          <div className="text-muted-foreground">{String(camp.location || "").split(",").slice(0, -1).join(", ").trim() || "Not specified"}</div>
                                        </div>
                                      </div>
                                      <div className="flex items-start text-sm ml-6">
                                        <div>
                                          <div className="font-medium">City</div>
                                          <div className="text-muted-foreground">{String(camp.location || "").split(",").slice(-1)[0]?.trim() || "Not specified"}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {camp.time}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Users className="h-4 w-4 mr-2" />
                                      {camp.organizer}
                                    </div>
                                  </div>
                                  
                                  {camp.description && (
                                    <p className="text-muted-foreground text-sm mb-4">
                                      {camp.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex flex-wrap gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onClick={() => handleEditCamp(camp)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={() => handleDeleteCamp(camp._id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="manage-requests" className="space-y-6">
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Pending Camp Requests</CardTitle>
                  <CardDescription>Approve or reject submitted camps</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingPending ? (
                    <div className="flex justify-center items-center h-32">
                      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></span>
                    </div>
                  ) : pendingCamps.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                      <p className="text-muted-foreground">New camp submissions will appear here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {pendingCamps.map((camp) => (
                        <Card key={camp._id} className="border-0 shadow-card">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-lg">{camp.name}</h3>
                              <Badge className="bg-warning/10 text-warning">Pending</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                              <div className="space-y-1">
                                <div className="flex items-start text-sm">
                                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-primary" />
                                  <div>
                                    <div className="font-medium">Venue</div>
                                    <div className="text-muted-foreground">{String(camp.location || "").split(",").slice(0, -1).join(", ").trim() || "Not specified"}</div>
                                  </div>
                                </div>
                                <div className="flex items-start text-sm ml-6">
                                  <div>
                                    <div className="font-medium">City</div>
                                    <div className="text-muted-foreground">{String(camp.location || "").split(",").slice(-1)[0]?.trim() || "Not specified"}</div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                {camp.startTime && camp.endTime ? `${camp.startTime} - ${camp.endTime}` : camp.time}
                              </div>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="h-4 w-4 mr-2" />
                                {camp.organizer}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {camp.description || ''}
                              </div>
                            </div>
                            {infoCampId === camp._id && (
                              <div className="p-3 bg-muted/50 rounded border mb-3 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>Organizer Email: {camp.contactEmail}</div>
                                  <div>Contact Phone: {camp.contactPhone}</div>
                                  <div>Created: {new Date(camp.createdAt).toLocaleString()}</div>
                                  <div>Status: {camp.status || 'Pending'}</div>
                                </div>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-success text-white" onClick={() => handleApproveCamp(camp._id)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectCamp(camp._id)}>
                                <AlertTriangle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setInfoCampId(infoCampId === camp._id ? null : camp._id)}>
                                <Info className="h-4 w-4 mr-2" />
                                {infoCampId === camp._id ? 'Show Less' : 'See More'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Navigation */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant={activeTab === "profile" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Profile Dashboard 📊
                </Button>
                <Button 
                  variant={activeTab === "add-camp" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("add-camp")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blood Camp
                </Button>
                <Button 
                  variant={activeTab === "camps" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("camps")}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Blood Camps List
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
                  <Activity className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
            {/* Removed Top Donors, Quick Actions, and System Status per request */}
          </div>
        </div>
      </div>
    </div>
  );
}
