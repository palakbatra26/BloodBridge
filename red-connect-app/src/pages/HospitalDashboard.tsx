import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Droplets, 
  Users, 
  Calendar,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Clock,
  Phone,
  Activity,
  BarChart3,
  Package
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

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

  const hospitalStats = {
    bloodInventory: 1250,
    dailyRequests: 15,
    activeDonors: 89,
    weeklyCollections: 45,
    emergencyStock: 85,
    partneredCamps: 8
  };

  const bloodInventory = [
    { type: "O+", current: 180, minimum: 150, status: "adequate" },
    { type: "O-", current: 45, minimum: 80, status: "low" },
    { type: "A+", current: 220, minimum: 200, status: "good" },
    { type: "A-", current: 75, minimum: 100, status: "low" },
    { type: "B+", current: 165, minimum: 150, status: "adequate" },
    { type: "B-", current: 30, minimum: 60, status: "critical" },
    { type: "AB+", current: 95, minimum: 80, status: "good" },
    { type: "AB-", current: 15, minimum: 40, status: "critical" }
  ];

  const activeRequests = [
    {
      id: 1,
      patientId: "P001",
      bloodType: "O-",
      unitsNeeded: 3,
      urgency: "Critical",
      department: "Emergency",
      timeRequested: "2 hours ago",
      status: "Searching",
      assignedDonors: 5
    },
    {
      id: 2,
      patientId: "P002",
      bloodType: "B+",
      unitsNeeded: 2,
      urgency: "High",
      department: "Surgery",
      timeRequested: "4 hours ago",
      status: "Matched",
      assignedDonors: 3
    },
    {
      id: 3,
      patientId: "P003",
      bloodType: "AB-",
      unitsNeeded: 1,
      urgency: "Medium",
      department: "Oncology",
      timeRequested: "6 hours ago",
      status: "In Progress",
      assignedDonors: 1
    }
  ];

  const upcomingCamps = [
    {
      id: 1,
      name: "Monthly Blood Drive",
      date: "2024-03-25",
      time: "9:00 AM - 5:00 PM",
      location: "Hospital Main Hall",
      expectedDonors: 150,
      registeredDonors: 89,
      status: "Confirmed"
    },
    {
      id: 2,
      name: "Emergency Collection Drive",
      date: "2024-03-28",
      time: "8:00 AM - 8:00 PM",
      location: "Hospital Campus",
      expectedDonors: 200,
      registeredDonors: 145,
      status: "Planning"
    }
  ];

  const recentDonations = [
    {
      id: 1,
      donorName: "Anonymous Donor",
      bloodType: "O+",
      units: 1,
      time: "30 minutes ago",
      department: "Blood Bank",
      status: "Completed"
    },
    {
      id: 2,
      donorName: "Anonymous Donor",
      bloodType: "A-",
      units: 1,
      time: "1 hour ago",
      department: "Blood Bank",
      status: "Processing"
    },
    {
      id: 3,
      donorName: "Anonymous Donor",
      bloodType: "B+",
      units: 1,
      time: "2 hours ago",
      department: "Blood Bank",
      status: "Completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-success";
      case "adequate":
        return "text-warning";
      case "low":
        return "text-orange-500";
      case "critical":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "good":
        return "bg-success/10 text-success";
      case "adequate":
        return "bg-warning/10 text-warning";
      case "low":
        return "bg-orange-100 text-orange-600";
      case "critical":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
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
              <h1 className="text-3xl font-bold text-foreground">Hospital Dashboard</h1>
              <p className="text-muted-foreground mt-1">City General Hospital - Blood Management System</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-success/10 text-success">
                <Activity className="h-4 w-4 mr-1" />
                Operational
              </Badge>
              <Button className="gradient-hero text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Blood Request
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Blood Inventory</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.bloodInventory}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +5% this week
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Daily Requests</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.dailyRequests}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-warning text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  3 urgent
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Donors</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.activeDonors}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Users className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12 today
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Weekly Collections</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.weeklyCollections}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Droplets className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  On target
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Emergency Stock</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.emergencyStock}%</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-warning text-sm">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Below target
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Blood Camps</p>
                  <p className="text-2xl font-bold text-foreground">{hospitalStats.partneredCamps}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center text-accent text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  2 upcoming
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="camps">Camps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Blood Inventory Overview */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Blood Inventory Overview</CardTitle>
                    <CardDescription>Current stock levels and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {bloodInventory.slice(0, 4).map((blood) => (
                        <div key={blood.type} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{blood.type}</span>
                            <Badge className={getStatusBadge(blood.status)}>
                              {blood.status}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Stock</span>
                              <span>{blood.current}/{blood.minimum}</span>
                            </div>
                            <Progress 
                              value={(blood.current / blood.minimum) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Donations */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>Latest blood donations received</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Droplets className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{donation.donorName}</p>
                              <p className="text-sm text-muted-foreground">
                                {donation.bloodType} • {donation.units} unit • {donation.time}
                              </p>
                            </div>
                          </div>
                          <Badge className={donation.status === "Completed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                            {donation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="inventory" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Complete Blood Inventory</CardTitle>
                    <CardDescription>Detailed view of all blood types and stock levels</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {bloodInventory.map((blood) => (
                        <div key={blood.type} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="font-bold text-xl">{blood.type}</span>
                            <Badge className={getStatusBadge(blood.status)}>
                              {blood.status}
                            </Badge>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Current Stock</span>
                              <span className="font-medium">{blood.current} units</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Minimum Required</span>
                              <span className="font-medium">{blood.minimum} units</span>
                            </div>
                            <Progress 
                              value={(blood.current / blood.minimum) * 100}
                              className="h-3"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>0</span>
                              <span>{blood.minimum}</span>
                            </div>
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
                    <CardTitle>Active Blood Requests</CardTitle>
                    <CardDescription>Current blood requests from hospital departments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeRequests.map((request) => (
                        <div key={request.id} className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Badge className="bg-primary/10 text-primary">
                                {request.patientId}
                              </Badge>
                              <Badge className="bg-secondary/10 text-secondary">
                                {request.bloodType}
                              </Badge>
                              <Badge className={getUrgencyBadge(request.urgency)}>
                                {request.urgency}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{request.timeRequested}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Department</p>
                              <p className="font-medium">{request.department}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Units Needed</p>
                              <p className="font-medium">{request.unitsNeeded}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium">{request.status}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Assigned Donors</p>
                              <p className="font-medium">{request.assignedDonors}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" className="gradient-hero text-white">
                              Update Status
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="camps" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Upcoming Blood Camps</CardTitle>
                    <CardDescription>Blood donation camps organized by the hospital</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingCamps.map((camp) => (
                        <div key={camp.id} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{camp.name}</h4>
                            <Badge className={camp.status === "Confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                              {camp.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{camp.date}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{camp.time}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{camp.location}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm">
                              <Users className="h-4 w-4 text-primary" />
                              <span>{camp.registeredDonors}/{camp.expectedDonors} registered</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span>Registration Progress</span>
                              <span>{camp.registeredDonors}/{camp.expectedDonors}</span>
                            </div>
                            <Progress 
                              value={(camp.registeredDonors / camp.expectedDonors) * 100}
                              className="h-2"
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              Manage Camp
                            </Button>
                            <Button size="sm" className="gradient-hero text-white">
                              View Registrations
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  New Blood Request
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Blood Camp
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Donors
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </CardContent>
            </Card>

            {/* Critical Alerts */}
            <Card className="border-0 shadow-card bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-sm">B- Blood Critical</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Only 30 units remaining (50% below minimum)</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="font-medium text-sm">AB- Blood Critical</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Only 15 units remaining (62% below minimum)</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span className="font-medium">Blood Bank Emergency</span>
                  </div>
                  <p className="font-bold text-lg text-primary">+91 7986904164</p>
                  <p className="text-sm text-muted-foreground">24/7 Emergency Support</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}