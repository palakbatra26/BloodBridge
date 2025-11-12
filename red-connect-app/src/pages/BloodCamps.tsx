import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Heart,
  User,
  Clock,
  Building2,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Droplets,
  AlertTriangle,
  Instagram
} from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/services/api";
import { useToast } from "@/hooks/use-toast";

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
  description?: string;
  imageUrl?: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BloodCamps() {
  const { toast } = useToast();
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [filteredCamps, setFilteredCamps] = useState<BloodCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showOwnCampForm, setShowOwnCampForm] = useState(false);
  const [selectedCamp, setSelectedCamp] = useState<BloodCamp | null>(null);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null);
  
  // Filter states
  const [sortBy, setSortBy] = useState<"date" | "name">("date");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");

  // Camp registration form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bloodType: "",
    age: "",
    emergencyContact: "",
    emergencyPhone: "",
    medicalHistory: "",
    agreeTerms: false,
    agreeNotifications: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const [ownCampData, setOwnCampData] = useState({
    campName: "",
    organizerName: "",
    organizerEmail: "",
    contact: "",
    date: "",
    time: "",
    location: "",
    description: "",
  });

  // FAQ data
  const faqs = [
    {
      question: "What should I bring to a blood camp?",
      answer: "Bring a valid ID proof (Aadhar card, passport, driver's license), any previous donation records if available, and wear comfortable clothing. Eat a healthy meal and stay hydrated before coming."
    },
    {
      question: "How long does the donation process take?",
      answer: "The entire process typically takes 30-45 minutes. The actual blood donation takes only 8-10 minutes. This includes registration, health screening, donation, and refreshments."
    },
    {
      question: "Is it safe to donate blood?",
      answer: "Yes, blood donation is very safe. All equipment is sterile and used only once. Our trained medical staff ensures your safety throughout the process."
    },
    {
      question: "How often can I donate blood?",
      answer: "You can donate whole blood every 3 months (12 weeks). For platelet donations, you can donate every 2 weeks. Your body replaces the blood volume within 24 hours."
    }
  ];

  useEffect(() => {
    fetchBloodCamps();
  }, []);

  // Filter and sort camps whenever camps, sortBy, filterLocation, or filterStatus changes
  useEffect(() => {
    let result = [...camps];
    
    // Filter by location
    if (filterLocation) {
      result = result.filter(camp => 
        camp.location.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    // Filter by status
    if (filterStatus !== "all") {
      const now = new Date();
      result = result.filter(camp => {
        const campDate = new Date(camp.date);
        return filterStatus === "upcoming" ? campDate >= now : campDate < now;
      });
    }
    
    // Sort by date or name
    result.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else {
        return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredCamps(result);
  }, [camps, sortBy, filterLocation, filterStatus]);

  const fetchBloodCamps = async () => {
    try {
      setLoading(true);
      const data = await api.getBloodCamps();
      setCamps(data);
    } catch (err) {
      setError("Failed to fetch blood camps. Please try again later.");
      console.error("Error fetching blood camps:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time from 24-hour to 12-hour format with AM/PM
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    // Handle cases where time might be in HH:MM format
    const [hours, minutes] = timeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Format time range
  const formatTimeRange = (startTime: string, endTime: string) => {
    if (!startTime || !endTime) return '';
    return `${formatTime(startTime)} to ${formatTime(endTime)}`;
  };

  // Check if camp is upcoming or past
  const getCampStatus = (campDate: string) => {
    const now = new Date();
    const date = new Date(campDate);
    return date >= now ? "upcoming" : "past";
  };

  // Get status badge
  const getStatusBadge = (campDate: string) => {
    const status = getCampStatus(campDate);
    return status === "upcoming" ? (
      <Badge className="bg-primary/10 text-primary">Upcoming</Badge>
    ) : (
      <Badge className="bg-muted text-muted-foreground">Past</Badge>
    );
  };

  const handleRegisterClick = (camp: BloodCamp) => {
    setSelectedCamp(camp);
    setShowRegistrationForm(true);
  };

  const handleRegisterOwnCampClick = () => {
    setShowOwnCampForm(true);
  };

  const handleBackToCamps = () => {
    setShowRegistrationForm(false);
    setSelectedCamp(null);
    // Reset form data
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bloodType: "",
      age: "",
      emergencyContact: "",
      emergencyPhone: "",
      medicalHistory: "",
      agreeTerms: false,
      agreeNotifications: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please accept the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare registration data
      const registrationData = {
        campId: selectedCamp?._id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        bloodType: formData.bloodType,
        age: formData.age ? parseInt(formData.age) : undefined,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        medicalHistory: formData.medicalHistory
      };

      // Register for camp
      await api.registerForCamp(registrationData);
      
      toast({
        title: "Registration Successful!",
        description: `You have been successfully registered for the ${selectedCamp?.name} blood camp.`,
      });
      
      // Reset form and go back to camps list
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        bloodType: "",
        age: "",
        emergencyContact: "",
        emergencyPhone: "",
        medicalHistory: "",
        agreeTerms: false,
        agreeNotifications: false
      });
      setShowRegistrationForm(false);
      setSelectedCamp(null);
    } catch (error: any) {
      console.error("Error during camp registration:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error registering for the camp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setActiveFAQ(activeFAQ === index ? null : index);
    // Scroll to the answer section
    setTimeout(() => {
      const element = document.getElementById(`faq-answer-${index}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  if (showRegistrationForm && selectedCamp) {
    return (
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Register for Camp</h1>
              <p className="text-muted-foreground mt-1">
                Registering for: <span className="font-semibold">{selectedCamp.name}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Date: {formatDate(selectedCamp.date)} | Time: {selectedCamp.time}
              </p>
            </div>
            <Button onClick={handleBackToCamps} variant="outline">
              Back to Camps
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Please provide your basic information for registration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="john.doe@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select onValueChange={(value) => setFormData({...formData, bloodType: value})} value={formData.bloodType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            <div className="flex items-center space-x-2">
                              <Droplets className="h-4 w-4 text-primary" />
                              <span>{type}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input 
                      id="age" 
                      type="number" 
                      placeholder="25" 
                      min="18" 
                      max="65" 
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>Emergency Contact</span>
                </CardTitle>
                <CardDescription>
                  Please provide emergency contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="emergencyPhone"
                        type="tel"
                        value={formData.emergencyPhone}
                        onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                        placeholder="+91 98765 43210"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>Medical Information</span>
                </CardTitle>
                <CardDescription>
                  Please provide any relevant medical history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="medicalHistory">Medical History</Label>
                  <Textarea
                    id="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                    placeholder="Any medical conditions, medications, or allergies that we should know about..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span>Terms & Conditions</span>
                </CardTitle>
                <CardDescription>
                  Please review and accept our terms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreeTerms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                    required
                  />
                  <label htmlFor="agreeTerms" className="text-sm text-muted-foreground">
                    I agree to the BloodBridge <a href="#" className="text-primary hover:underline">Terms of Service</a> and <a href="#" className="text-primary hover:underline">Privacy Policy</a>. I confirm that all provided information is accurate.
                  </label>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="agreeNotifications"
                    checked={formData.agreeNotifications}
                    onCheckedChange={(checked) => setFormData({...formData, agreeNotifications: checked as boolean})}
                  />
                  <label htmlFor="agreeNotifications" className="text-sm text-muted-foreground">
                    I would like to receive important updates and notifications about this camp via email and SMS.
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1 gradient-hero text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Registering...
                  </span>
                ) : (
                  "Register for Camp"
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={handleBackToCamps}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (showOwnCampForm) {
    return (
      <div className="min-h-screen bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Camp Registration Form</h1>
              <p className="text-muted-foreground mt-1">Submit your camp for admin approval</p>
            </div>
            <Button onClick={() => setShowOwnCampForm(false)} variant="outline">Back to Camps</Button>
          </div>

          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!ownCampData.campName || !ownCampData.organizerName || !ownCampData.organizerEmail || !ownCampData.contact || !ownCampData.date || !ownCampData.location) {
              toast({ title: 'Missing information', description: 'Please fill all required fields', variant: 'destructive' });
              return;
            }
            try {
              await api.requestCamp(ownCampData);
              toast({ title: 'Submitted', description: 'Your camp registration has been submitted for admin approval.' });
              setShowOwnCampForm(false);
              setOwnCampData({ campName: '', organizerName: '', organizerEmail: '', contact: '', date: '', time: '', location: '', description: '' });
            } catch (err: any) {
              toast({ title: 'Submission failed', description: err?.message || 'Please try again.', variant: 'destructive' });
            }
          }} className="space-y-8">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Camp Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="campName">Camp Name *</Label>
                    <Input id="campName" value={ownCampData.campName} onChange={(e) => setOwnCampData({ ...ownCampData, campName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="organizerName">Organizer Name *</Label>
                    <Input id="organizerName" value={ownCampData.organizerName} onChange={(e) => setOwnCampData({ ...ownCampData, organizerName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="organizerEmail">Organizer Email *</Label>
                    <Input id="organizerEmail" type="email" value={ownCampData.organizerEmail} onChange={(e) => setOwnCampData({ ...ownCampData, organizerEmail: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Number *</Label>
                    <Input id="contact" value={ownCampData.contact} onChange={(e) => setOwnCampData({ ...ownCampData, contact: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={ownCampData.date} onChange={(e) => setOwnCampData({ ...ownCampData, date: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="time">Time</Label>
                    <Input id="time" type="time" value={ownCampData.time} onChange={(e) => setOwnCampData({ ...ownCampData, time: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input id="location" placeholder="Enter location" value={ownCampData.location} onChange={(e) => setOwnCampData({ ...ownCampData, location: e.target.value })} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description">Description / Notes</Label>
                  <Textarea id="description" rows={3} value={ownCampData.description} onChange={(e) => setOwnCampData({ ...ownCampData, description: e.target.value })} />
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-4">
              <Button type="submit" className="gradient-hero text-white">Submit for Approval</Button>
              <Button type="button" variant="outline" onClick={() => setShowOwnCampForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Save Lives
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Blood Donation <span className="text-primary">Camps</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join us at upcoming blood donation camps in your area. Your donation can save up to three lives.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-card">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Error Loading Camps</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchBloodCamps} className="gradient-hero text-white">
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : camps.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-card">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Upcoming Camps</h3>
              <p className="text-muted-foreground mb-4">
                There are currently no upcoming blood donation camps scheduled. Check back later for updates.
              </p>
              <Button onClick={handleRegisterOwnCampClick} className="gradient-hero text-white">
                <Mail className="h-4 w-4 mr-2" />
                Register Camp
              </Button>
            </CardContent>
          </Card>
        ) : filteredCamps.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-card">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No Camps Found</h3>
              <p className="text-muted-foreground mb-4">
                No blood donation camps match your current filters. Try adjusting your search criteria.
              </p>
              <Button onClick={fetchBloodCamps} className="gradient-hero text-white">
                View All Camps
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Filter and Sort Controls */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <div className="flex-1 min-w-[200px]">
                  <Input
                    placeholder="Filter by location..."
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterStatus} onValueChange={(value: "all" | "upcoming" | "past") => setFilterStatus(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Camps</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="past">Past</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <Select value={sortBy} onValueChange={(value: "date" | "name") => setSortBy(value)}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Sort by Date</SelectItem>
                    <SelectItem value="name">Sort by Name</SelectItem>
                  </SelectContent>
                </Select>
                
                {(filterLocation || filterStatus !== "all") && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilterLocation("");
                      setFilterStatus("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Camps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCamps.map((camp) => (
                <Card key={camp._id} className="border-0 shadow-card hover:shadow-lg transition-shadow">
                  {/* Camp Image */}
                  {camp.imageUrl && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img 
                        src={camp.imageUrl} 
                        alt={camp.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide the image container if the image fails to load
                          const target = e.target as HTMLImageElement;
                          target.parentElement!.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-xl font-bold">{camp.name}</CardTitle>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          <span>Organized by {camp.organizer}</span>
                        </div>
                      </div>
                      {getStatusBadge(camp.date)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg mt-1">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Location</p>
                        <p className="text-sm text-muted-foreground">{camp.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-accent/10 rounded-lg mt-1">
                        <Calendar className="h-4 w-4 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(camp.date)} at {camp.startTime && camp.endTime ? formatTimeRange(camp.startTime, camp.endTime) : formatTime(camp.time)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-success/10 rounded-lg mt-1">
                        <Phone className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">Contact</p>
                        <a 
                          href={`tel:${camp.contactPhone}`} 
                          className="text-sm text-primary hover:underline block"
                        >
                          {camp.contactPhone}
                        </a>
                        <a 
                          href={`mailto:${camp.contactEmail}`} 
                          className="text-sm text-primary hover:underline block"
                        >
                          {camp.contactEmail}
                        </a>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleRegisterClick(camp)} 
                      className="w-full gradient-hero text-white mt-4"
                      disabled={getCampStatus(camp.date) === "past"}
                    >
                      {getCampStatus(camp.date) === "past" ? "Camp Ended" : "Register for Camp"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Register Camp Button */}
        <div className="text-center mt-12">
          <Button onClick={handleRegisterOwnCampClick} className="gradient-hero text-white">
            <Building2 className="h-4 w-4 mr-2" />
            Register Your Own Camp
          </Button>
        </div>

        {/* WhatsApp Group Card */}
        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="border-0 shadow-card">
            <CardContent className="p-8 text-center">
              <div className="p-4 bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-green-500">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 5.152-.525c2.88-.388 5.746-1.263 8.539-2.573 1.697-.796 3.384-1.78 5.018-2.947a.75.75 0 0 0-.171-1.247c-1.64-.75-3.347-1.34-5.085-1.76a41.347 41.347 0 0 0-5.59-1.01c-.1 0-.2-.003-.3-.008a.75.75 0 0 0-.75.684l-.008.3c0 .194.072.38.2.523.118.13.28.208.45.218.17.01.337-.04.475-.14.137-.1.24-.243.293-.408.053-.165.053-.345 0-.51-.053-.165-.156-.308-.293-.408a.75.75 0 0 0-.85.122 39.84 39.84 0 0 1-5.47 4.05c-2.59 1.44-5.24 2.25-7.9 2.59a45.15 45.15 0 0 1-4.38.255V3.75c.982-.045 1.957-.156 2.917-.33.875-.158 1.737-.36 2.58-.603a.75.75 0 0 0 .52-.838l-.33-.99a.75.75 0 0 0-.94-.524l-.99.33Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Join Our WhatsApp Group</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Stay updated with the latest blood donation camps, emergency requests, and community activities. Join our WhatsApp group for real-time information and coordination.
              </p>
              <a 
                href="https://chat.whatsapp.com/GbjD7jPiucx0o9keifh34r?mode=ems_share_t" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                  <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 5.152-.525c2.88-.388 5.746-1.263 8.539-2.573 1.697-.796 3.384-1.78 5.018-2.947a.75.75 0 0 0-.171-1.247c-1.64-.75-3.347-1.34-5.085-1.76a41.347 41.347 0 0 0-5.59-1.01c-.1 0-.2-.003-.3-.008a.75.75 0 0 0-.75.684l-.008.3c0 .194.072.38.2.523.118.13.28.208.45.218.17.01.337-.04.475-.14.137-.1.24-.243.293-.408.053-.165.053-.345 0-.51-.053-.165-.156-.308-.293-.408a.75.75 0 0 0-.85.122 39.84 39.84 0 0 1-5.47 4.05c-2.59 1.44-5.24 2.25-7.9 2.59a45.15 45.15 0 0 1-4.38.255V3.75c.982-.045 1.957-.156 2.917-.33.875-.158 1.737-.36 2.58-.603a.75.75 0 0 0 .52-.838l-.33-.99a.75.75 0 0 0-.94-.524l-.99.33Z" />
                </svg>
                Join WhatsApp Group
              </a>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <h2 className="text-2xl font-bold text-center">Frequently Asked Questions</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-border pb-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer py-2"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    {activeFAQ === index ? 
                      <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : 
                      <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    }
                  </div>
                  {activeFAQ === index && (
                    <p id={`faq-answer-${index}`} className="text-muted-foreground mt-2 pb-4">{faq.answer}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <Card className="border-0 shadow-card">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="p-4 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Why Donate Blood?</h3>
                  <p className="text-muted-foreground text-sm">
                    Your blood donation can save up to three lives. It's safe, simple, and makes a huge difference.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-accent/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Before the Camp</h3>
                  <p className="text-muted-foreground text-sm">
                    Eat well, stay hydrated, and get a good night's sleep before donating blood.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="p-4 bg-success/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Instagram className="h-8 w-8 text-success" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Follow us on Instagram</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Follow our Instagram handle for updates and inspiration.
                  </p>
                  <a 
                    href="https://www.instagram.com/palakbatra26_/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:underline"
                  >
                    <Instagram className="h-5 w-5 mr-2" />
                    <span>@palakbatra26_</span>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
