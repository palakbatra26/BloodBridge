import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Award, 
  Calendar, 
  Bell, 
  MapPin, 
  Trophy,
  TrendingUp,
  Clock,
  Droplets,
  Star,
  Gift,
  Activity
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();

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

  // For now, we'll use mock data since we don't have the full user data from Clerk
  // In a real implementation, you would fetch additional user data from your backend
  const donorStats = {
    totalDonations: 12,
    totalPoints: 2400,
    livesImpacted: 36,
    nextEligible: "2024-03-15",
    bloodType: "O+", // This would come from your backend
    donorLevel: "Gold"
  };

  const recentDonations = [
    { date: "2024-01-15", location: "City General Hospital", points: 200, status: "completed" },
    { date: "2023-11-10", location: "Red Cross Center", points: 200, status: "completed" },
    { date: "2023-09-05", location: "Community Health Center", points: 200, status: "completed" },
  ];

  const urgentRequests = [
    {
      id: 1,
      bloodType: "O+",
      location: "Emergency Hospital",
      distance: "2.3 km",
      urgency: "Critical",
      time: "2 hours ago",
      points: 300
    },
    {
      id: 2,
      bloodType: "O+",
      location: "Children's Hospital",
      distance: "5.1 km",
      urgency: "High",
      time: "5 hours ago",
      points: 250
    }
  ];

  const achievements = [
    { icon: Heart, title: "Life Saver", description: "10+ donations", earned: true },
    { icon: Trophy, title: "Gold Donor", description: "1000+ points", earned: true },
    { icon: Calendar, title: "Regular Hero", description: "6 months streak", earned: true },
    { icon: Star, title: "Community Champion", description: "Referred 5 donors", earned: false },
  ];

  const upcomingCamps = [
    {
      date: "2024-03-20",
      location: "Punjab University",
      time: "9:00 AM - 5:00 PM",
      distance: "1.2 km"
    },
    {
      date: "2024-03-25",
      location: "Mall of Ludhiana",
      time: "10:00 AM - 6:00 PM",
      distance: "3.5 km"
    }
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Donor Dashboard</h1>
              <p className="text-muted-foreground mt-1">Welcome back, {user?.firstName || 'Donor'}! 🩸</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-success/10 text-success">
                <Activity className="h-4 w-4 mr-1" />
                Eligible to Donate
              </Badge>
              <Button className="gradient-hero text-white">
                <Bell className="h-4 w-4 mr-2" />
                Enable Alerts
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Donations</p>
                  <p className="text-2xl font-bold text-foreground">{donorStats.totalDonations}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-success text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2 this quarter
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Reward Points</p>
                  <p className="text-2xl font-bold text-foreground">{donorStats.totalPoints}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Award className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-accent text-sm">
                  <Gift className="h-4 w-4 mr-1" />
                  100 points to next reward
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Lives Impacted</p>
                  <p className="text-2xl font-bold text-foreground">{donorStats.livesImpacted}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Heart className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-success text-sm">
                  <Star className="h-4 w-4 mr-1" />
                  3 lives per donation
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Donor Level</p>
                  <p className="text-2xl font-bold text-foreground">{donorStats.donorLevel}</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Trophy className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={75} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">75% to Platinum</p>
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
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="camps">Camps</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Urgent Requests */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Bell className="h-5 w-5 text-primary pulse-urgent" />
                      <span>Urgent Blood Requests</span>
                    </CardTitle>
                    <CardDescription>
                      Compatible blood requests in your area
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {urgentRequests.map((request) => (
                      <div key={request.id} className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-destructive/10 text-destructive">
                              {request.urgency}
                            </Badge>
                            <span className="font-medium">{request.bloodType} needed</span>
                          </div>
                          <div className="text-sm text-muted-foreground">{request.time}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {request.location}
                            </div>
                            <div>{request.distance}</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-accent">+{request.points} pts</span>
                            <Button size="sm" className="gradient-hero text-white">
                              Respond
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Next Donation */}
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Next Donation Eligibility</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-success">March 15, 2024</p>
                          <p className="text-sm text-muted-foreground">You can donate again</p>
                        </div>
                      </div>
                      <Button className="gradient-accent text-white">
                        Schedule Donation
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Donation History</CardTitle>
                    <CardDescription>
                      Your complete donation journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDonations.map((donation, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Droplets className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{donation.location}</p>
                              <p className="text-sm text-muted-foreground">{donation.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className="bg-success/10 text-success">
                              +{donation.points} pts
                            </Badge>
                            <Badge variant="outline">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="rewards" className="space-y-6">
                <Card className="border-0 shadow-card">
                  <CardHeader>
                    <CardTitle>Achievements & Rewards</CardTitle>
                    <CardDescription>
                      Your milestones and earned badges
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div key={index} className={`p-4 rounded-lg border-2 ${
                          achievement.earned 
                            ? "border-success bg-success/5" 
                            : "border-muted bg-muted/30"
                        }`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <achievement.icon className={`h-5 w-5 ${
                              achievement.earned ? "text-success" : "text-muted-foreground"
                            }`} />
                            <span className="font-medium">{achievement.title}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
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
                    <CardDescription>
                      Blood donation camps near you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingCamps.map((camp, index) => (
                        <div key={index} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">{camp.location}</h4>
                            <Badge variant="outline">{camp.distance}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {camp.date}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {camp.time}
                            </div>
                          </div>
                          <Button className="w-full">
                            Register for Camp
                          </Button>
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
            {/* Profile Card */}
            <Card className="border-0 shadow-card">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.firstName} {user?.lastName}</h3>
                  <p className="text-muted-foreground">Blood Type: {donorStats.bloodType}</p>
                  <Badge className="mt-2 bg-warning/10 text-warning">
                    {donorStats.donorLevel} Donor
                  </Badge>
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
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Donation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MapPin className="h-4 w-4 mr-2" />
                  Find Blood Camps
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Gift className="h-4 w-4 mr-2" />
                  Redeem Rewards
                </Button>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Donor Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Stay hydrated before donating</li>
                  <li>• Eat iron-rich foods regularly</li>
                  <li>• Get adequate sleep before donation</li>
                  <li>• Avoid alcohol 24 hours before donation</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}