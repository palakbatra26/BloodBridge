import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Droplets, 
  Building2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
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
  Filter
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import api from "@/services/api";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [bloodCamps, setBloodCamps] = useState<BloodCamp[]>([]);
  const [loadingCamps, setLoadingCamps] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  
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

  const systemStats = {
    totalDonors: 25847,
    totalRecipients: 3254,
    hospitalPartners: 156,
    bloodUnitsCollected: 52890,
    activeCamps: 12,
    urgentRequests: 8
  };

  // Fetch blood camps when the component mounts or when the camps tab is selected
  useEffect(() => {
    if (activeTab === "camps") {
      fetchBloodCamps();
    }
  }, [activeTab]);

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
      
      // Format time as "startTime - endTime" for backward compatibility
      let formattedTime = "";
      if (campData.startTime && campData.endTime) {
        formattedTime = `${campData.startTime} - ${campData.endTime}`;
      } else if (campData.startTime) {
        formattedTime = campData.startTime;
      } else {
        formattedTime = campData.time;
      }
      
      // In a real app, you would get the actual user ID from auth context
      // For now, we'll use a placeholder ObjectId string
      const campDataWithUser = {
        ...campData,
        time: formattedTime,
        createdBy: "68e269b9c4d5ce29ea4f9b48" // Placeholder valid ObjectId for testing
      };
      
      await api.addBloodCamp(campDataWithUser, token);
      setSubmitSuccess(true);
      
      // Reset form and image preview
      setCampData({
        name: "",
        location: "",
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
      
      // Format time as "startTime - endTime" for backward compatibility
      let formattedTime = "";
      if (editCampData.startTime && editCampData.endTime) {
        formattedTime = `${editCampData.startTime} - ${editCampData.endTime}`;
      } else if (editCampData.startTime) {
        formattedTime = editCampData.startTime;
      } else {
        formattedTime = editCampData.time;
      }
      
      await api.updateBloodCamp(editCampData._id, {
        name: editCampData.name,
        location: editCampData.location,
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

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Donors</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.totalDonors.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% this month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Blood Units</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.bloodUnitsCollected.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Droplets className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +8% this month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Hospital Partners</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.hospitalPartners}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5 this month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Recipients</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.totalRecipients.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Heart className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +15% this month
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Camps</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.activeCamps}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-accent text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  This week
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Urgent Requests</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.urgentRequests}</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-destructive text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Needs attention
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="add-camp">Add Camp</TabsTrigger>
                <TabsTrigger value="camps">Blood Camps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recent Activity */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Recent System Activity</CardTitle>
                    <CardDescription>Latest activities across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-shrink-0">
                            {getStatusIcon(activity.status)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>System Health Overview</CardTitle>
                    <CardDescription>Key performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-success/10 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-success" />
                          <span className="font-medium text-success">Server Uptime</span>
                        </div>
                        <p className="text-2xl font-bold">99.9%</p>
                      </div>
                      <div className="p-4 bg-accent/10 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Activity className="h-5 w-5 text-accent" />
                          <span className="font-medium text-accent">Response Time</span>
                        </div>
                        <p className="text-2xl font-bold">&lt; 200ms</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Blood Inventory Status</CardTitle>
                    <CardDescription>Current blood stock levels across all blood banks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {bloodInventory.map((blood) => (
                        <div key={blood.type} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{blood.type}</span>
                            <Badge className="bg-primary/10 text-primary">
                              {blood.percentage}%
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Available</span>
                              <span>{blood.available}/{blood.required}</span>
                            </div>
                            <Progress 
                              value={blood.percentage} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requests" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Urgent Blood Requests</CardTitle>
                    <CardDescription>Critical requests requiring immediate attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {urgentRequests.map((request) => (
                        <div key={request.id} className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-primary/10 text-primary">
                                {request.bloodType}
                              </Badge>
                              <Badge className={getUrgencyBadge(request.status)}>
                                {request.status}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{request.timePosted}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">{request.hospital}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.unitsNeeded} units needed • {request.matchedDonors} donors matched
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" className="gradient-hero text-white">Prioritize</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          placeholder="123 Main Street, City"
                          value={isEditing ? editCampData.location : campData.location}
                          onChange={isEditing ? handleEditCampInputChange : handleCampInputChange}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <MapPin className="h-4 w-4 mr-2" />
                                      {camp.location}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      {camp.startTime && camp.endTime 
                                        ? `${camp.startTime} - ${camp.endTime}` 
                                        : camp.time}
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
                  variant={activeTab === "overview" ? "default" : "outline"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("overview")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Dashboard Overview
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
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  Donor Records
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
                  <Activity className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Top Donors</CardTitle>
                <CardDescription>Most active blood donors this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((donor, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{donor.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {donor.donations} donations • {donor.points} pts
                        </p>
                      </div>
                      <Badge className="text-xs bg-warning/10 text-warning">
                        {donor.level}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="h-4 w-4 mr-2" />
                  Hospital Network
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Blood Camp Approval
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge className="bg-success/10 text-success text-xs">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Notifications</span>
                  <Badge className="bg-success/10 text-success text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Blood Matching</span>
                  <Badge className="bg-success/10 text-success text-xs">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">External APIs</span>
                  <Badge className="bg-warning/10 text-warning text-xs">Partial</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}