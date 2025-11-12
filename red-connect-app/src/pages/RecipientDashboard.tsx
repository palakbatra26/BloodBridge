import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Heart, 
  Clock, 
  MapPin, 
  Phone,
  Users,
  AlertTriangle,
  CheckCircle,
  Search,
  Plus,
  Droplets,
  Activity
} from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { rankDonorsForRequest } from "@/features/matching";
import type { Donor, BloodRequest } from "@/features/types";

export default function RecipientDashboard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useUser();
  const { signOut, getToken } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestBloodType, setRequestBloodType] = useState<string>("");
  const [requestUnits, setRequestUnits] = useState<number>(1);
  const [requestHospital, setRequestHospital] = useState<string>("");
  const [requestCity, setRequestCity] = useState<string>("");
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [ranking, setRanking] = useState<ReturnType<typeof rankDonorsForRequest>>([]);
  const [matchingError, setMatchingError] = useState<string>("");
  const [matchingLoading, setMatchingLoading] = useState(false);

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

  const activeRequests = [
    {
      id: 1,
      bloodType: "O+",
      unitsNeeded: 3,
      urgency: "Critical",
      hospital: "City General Hospital",
      dateCreated: "2024-03-15",
      status: "Active",
      matchedDonors: 12,
      collectedUnits: 1
    },
    {
      id: 2,
      bloodType: "AB-",
      unitsNeeded: 2,
      urgency: "High",
      hospital: "Children's Hospital",
      dateCreated: "2024-03-14",
      status: "In Progress",
      matchedDonors: 5,
      collectedUnits: 0
    }
  ];

  const recentMatches = [
    {
      id: 1,
      donorName: "Anonymous Donor #1",
      bloodType: "O+",
      distance: "2.3 km",
      availability: "Available Today",
      contact: "+91 98765 43210",
      status: "Confirmed"
    },
    {
      id: 2,
      donorName: "Anonymous Donor #2",
      bloodType: "O+",
      distance: "5.1 km",
      availability: "Available Tomorrow",
      contact: "+91 98765 43211",
      status: "Pending"
    }
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const urgencyLevels = ["Low", "Medium", "High", "Critical"];

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-success/10 text-success";
      case "In Progress":
        return "bg-warning/10 text-warning";
      case "Completed":
        return "bg-accent/10 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSubmitRequest = async () => {
    try {
      setMatchingError("");
      setMatchingLoading(true);
      const token = await getToken();
      const donors = await api.getDonors({ bloodType: undefined, city: requestCity || undefined }, token || undefined);
      const donorList: Donor[] = donors.map((d: any) => ({
        id: d.id,
        name: d.name,
        bloodType: d.bloodType,
        lastDonationDate: d.lastDonationDate,
      }));
      setMatchedDonors(donorList);
      const req: BloodRequest = {
        id: "req-local",
        hospital: requestHospital || "",
        bloodType: requestBloodType as any,
        unitsNeeded: requestUnits,
      };
      const ranked = rankDonorsForRequest(donorList, req);
      setRanking(ranked);
      setShowRequestForm(false);
    } catch (err: any) {
      setMatchingError(err?.message || "Failed to match donors");
    } finally {
      setMatchingLoading(false);
    }
  };

  const handleSendSOS = async () => {
    try {
      const token = await getToken();
      await api.sendSOSAlert({
        bloodType: requestBloodType,
        unitsNeeded: requestUnits,
        city: requestCity,
      }, token || undefined);
      alert("SOS alert queued for eligible nearby donors");
    } catch (err) {
      alert("Failed to send SOS");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Recipient Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your blood requests and connect with donors</p>
            </div>
            <Button 
              onClick={() => setShowRequestForm(true)}
              className="gradient-hero text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Blood Request
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Requests</p>
                  <p className="text-2xl font-bold text-foreground">2</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Matched Donors</p>
                  <p className="text-2xl font-bold text-foreground">17</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-lg">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Units Collected</p>
                  <p className="text-2xl font-bold text-foreground">1/5</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg">
                  <Droplets className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Response Time</p>
                  <p className="text-2xl font-bold text-foreground">&lt; 2h</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Active Requests */}
          <div className="space-y-6">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>Active Blood Requests</span>
                </CardTitle>
                <CardDescription>
                  Your current blood requests and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {matchingError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive text-sm">{matchingError}</p>
                  </div>
                )}
                {ranking.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Top Matched Donors</h4>
                      <Button size="sm" variant="outline" onClick={handleSendSOS}>
                        Send SOS
                      </Button>
                    </div>
                    {ranking.slice(0, 10).map((d) => (
                      <div key={d.id} className="p-3 bg-muted/50 rounded border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{d.name}</p>
                            <p className="text-sm text-muted-foreground">{d.bloodType}</p>
                          </div>
                          <Badge className="bg-success/10 text-success">Score {d.score.toFixed(2)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {d.eligible ? 'Eligible' : `Next: ${d.nextEligibleDate ? new Date(d.nextEligibleDate).toLocaleDateString() : 'N/A'}`}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {activeRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-muted/50 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-primary/10 text-primary">
                          {request.bloodType}
                        </Badge>
                        <Badge className={getUrgencyBadge(request.urgency)}>
                          {request.urgency}
                        </Badge>
                        <Badge className={getStatusBadge(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {request.dateCreated}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{request.hospital}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Units needed: {request.unitsNeeded}</span>
                        <span>Collected: {request.collectedUnits}</span>
                        <span>Donors matched: {request.matchedDonors}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Collection Progress</span>
                        <span>{request.collectedUnits}/{request.unitsNeeded}</span>
                      </div>
                      <Progress 
                        value={(request.collectedUnits / request.unitsNeeded) * 100}
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleSendSOS}>
                        Send SOS
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-0 shadow-card bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Emergency Contact</CardTitle>
                <CardDescription>
                  For urgent blood requirements, call our 24/7 hotline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="font-bold text-destructive text-lg">+91 7986904164</p>
                    <p className="text-sm text-muted-foreground">24/7 Emergency Support</p>
                  </div>
                  <Button className="bg-destructive hover:bg-destructive/90 text-white">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Matched Donors & Request Form */}
          <div className="space-y-6">
            {!showRequestForm ? (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-accent" />
                    <span>Matched Donors</span>
                  </CardTitle>
                  <CardDescription>
                    Compatible donors who can help with your requests
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentMatches.map((match) => (
                    <div key={match.id} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                            <Heart className="h-5 w-5 text-accent" />
                          </div>
                          <div>
                            <p className="font-medium">{match.donorName}</p>
                            <p className="text-sm text-muted-foreground">{match.bloodType} • {match.distance}</p>
                          </div>
                        </div>
                        <Badge className={match.status === "Confirmed" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}>
                          {match.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{match.availability}</span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                          {match.status === "Pending" && (
                            <Button size="sm" className="gradient-hero text-white">
                              Confirm
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-card">
                <CardHeader>
                  <CardTitle>Submit Blood Request</CardTitle>
                  <CardDescription>
                    Fill out the details for your blood requirement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type Required</Label>
                      <Select value={requestBloodType} onValueChange={setRequestBloodType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="units">Units Needed</Label>
                      <Input id="units" type="number" placeholder="1" min="1" max="10" value={requestUnits} onChange={(e) => setRequestUnits(Number(e.target.value))} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level} value={level.toLowerCase()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital/Medical Facility</Label>
                    <Input id="hospital" placeholder="Enter hospital name" value={requestHospital} onChange={(e) => setRequestHospital(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input id="patientName" placeholder="Enter patient name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">Contact Person</Label>
                    <Input id="contactPerson" placeholder="Your name" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input id="contactPhone" type="tel" placeholder="+91 98765 43210" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Enter city" value={requestCity} onChange={(e) => setRequestCity(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalReason">Medical Reason (Optional)</Label>
                    <Textarea 
                      id="medicalReason" 
                      placeholder="Brief description of the medical condition requiring blood transfusion"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button 
                      className="flex-1 gradient-hero text-white"
                      onClick={handleSubmitRequest}
                      disabled={matchingLoading || !requestBloodType}
                    >
                      {matchingLoading ? 'Matching...' : 'Submit Request'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help & Support */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Find Nearby Blood Banks
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Heart className="h-4 w-4 mr-2" />
                  Request Emergency Support
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Support Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
