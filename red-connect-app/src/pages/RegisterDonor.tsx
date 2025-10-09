import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Heart, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Droplets,
  Shield,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Instagram
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

export default function RegisterDonor() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bloodType: "",
    gender: "",
    weight: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    medicalHistory: "",
    lastDonation: "",
    emergencyContact: "",
    emergencyPhone: "",
    agreeTerms: false,
    agreeNotifications: false
  });

  const [eligibilityStatus, setEligibilityStatus] = useState<"checking" | "eligible" | "ineligible" | null>(null);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null); // Added for FAQ toggle

  // FAQ data
  const faqs = [
    {
      question: "What are the eligibility criteria for blood donation?",
      answer: "You must be between 18-65 years old, weigh at least 50kg, be in good health, and not have donated blood in the last 3 months. Certain medical conditions may affect eligibility."
    },
    {
      question: "What documents do I need to register?",
      answer: "You'll need a valid ID proof (Aadhar card, passport, driver's license) and contact information. Medical history information will help determine your eligibility."
    },
    {
      question: "How will I be notified about blood camps?",
      answer: "Once registered, you'll receive notifications about upcoming blood camps in your area via email and SMS. You can also check the Blood Camps page on our website."
    },
    {
      question: "Can I update my information after registration?",
      answer: "Yes, you can update your information anytime by logging into your donor dashboard. Keeping your information current helps us match you with relevant donation opportunities."
    }
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const states = ["Punjab", "Delhi", "Maharashtra", "Karnataka", "Tamil Nadu", "Gujarat", "Rajasthan", "Uttar Pradesh"];

  const checkEligibility = () => {
    setEligibilityStatus("checking");
    
    // Simulate eligibility check
    setTimeout(() => {
      const weight = parseFloat(formData.weight);
      const birthDate = new Date(formData.dateOfBirth);
      const age = Math.floor((new Date().getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      
      if (age < 18 || age > 65) {
        setEligibilityStatus("ineligible");
        setEligibilityMessage("Age must be between 18-65 years");
      } else if (weight < 50) {
        setEligibilityStatus("ineligible");
        setEligibilityMessage("Minimum weight requirement is 50 kg");
      } else {
        setEligibilityStatus("eligible");
        setEligibilityMessage("You are eligible to donate blood!");
      }
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (eligibilityStatus !== "eligible") {
      toast({
        title: "Eligibility Check Required",
        description: "Please complete the eligibility check first.",
        variant: "destructive",
      });
      return;
    }

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
      // Prepare donor data for submission
      const donorData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        bloodType: formData.bloodType,
        gender: formData.gender,
        weight: parseFloat(formData.weight),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        medicalHistory: formData.medicalHistory,
        lastDonation: formData.lastDonation,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone
      };

      // Register donor
      await api.registerDonor(donorData);
      
      toast({
        title: "Registration Successful!",
        description: "Welcome to BloodBridge! You will receive a confirmation email shortly.",
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        bloodType: "",
        gender: "",
        weight: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        medicalHistory: "",
        lastDonation: "",
        emergencyContact: "",
        emergencyPhone: "",
        agreeTerms: false,
        agreeNotifications: false
      });
      setEligibilityStatus(null);
    } catch (error) {
      console.error("Error during donor registration:", error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering as a donor. Please try again.",
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

  return (
    <div className="min-h-screen bg-muted/30 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Donor Registration
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Join Our <span className="text-primary">Life-Saving</span> Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Register as a blood donor and help save lives in your community. Your donation can save up to 3 lives!
          </p>
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    placeholder="Min 50 kg"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Droplets className="h-5 w-5 text-primary" />
                <span>Medical Information</span>
              </CardTitle>
              <CardDescription>
                Medical details required for blood donation eligibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bloodType">Blood Type *</Label>
                  <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastDonation">Last Donation Date</Label>
                  <Input
                    id="lastDonation"
                    type="date"
                    value={formData.lastDonation}
                    onChange={(e) => setFormData({...formData, lastDonation: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medicalHistory">Medical History</Label>
                <Textarea
                  id="medicalHistory"
                  placeholder="Please mention any medical conditions, medications, or surgeries..."
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                />
              </div>

              {/* Eligibility Check */}
              <div className="p-4 border border-border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Eligibility Check</h4>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={checkEligibility}
                    disabled={eligibilityStatus === "checking" || !formData.dateOfBirth || !formData.weight}
                  >
                    {eligibilityStatus === "checking" ? "Checking..." : "Check Eligibility"}
                  </Button>
                </div>
                
                {eligibilityStatus && (
                  <div className={`p-3 rounded-lg flex items-center space-x-2 ${
                    eligibilityStatus === "eligible" 
                      ? "bg-success/10 text-success" 
                      : eligibilityStatus === "ineligible"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-muted"
                  }`}>
                    {eligibilityStatus === "eligible" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : eligibilityStatus === "ineligible" ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : null}
                    <span>{eligibilityMessage}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Address Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(value) => setFormData({...formData, state: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Emergency Contact</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({...formData, emergencyPhone: e.target.value})}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Conditions */}
          <Card className="border-0 shadow-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => setFormData({...formData, agreeTerms: checked as boolean})}
                />
                <Label htmlFor="agreeTerms" className="text-sm leading-relaxed">
                  I agree to the <span className="text-primary underline cursor-pointer">Terms & Conditions</span> and 
                  <span className="text-primary underline cursor-pointer"> Privacy Policy</span>. I confirm that all information provided is accurate.
                </Label>
              </div>
              
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="agreeNotifications"
                  checked={formData.agreeNotifications}
                  onCheckedChange={(checked) => setFormData({...formData, agreeNotifications: checked as boolean})}
                />
                <Label htmlFor="agreeNotifications" className="text-sm">
                  I agree to receive notifications about blood donation camps and urgent requests.
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button 
              type="submit" 
              size="lg" 
              className="gradient-hero text-white w-full md:w-auto px-12"
              disabled={eligibilityStatus !== "eligible" || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Registering...
                </span>
              ) : (
                <>
                  <Heart className="h-5 w-5 mr-2" />
                  Complete Registration
                </>
              )}
            </Button>
            {eligibilityStatus !== "eligible" && (
              <p className="text-sm text-muted-foreground mt-2">
                Complete eligibility check to proceed with registration
              </p>
            )}
          </div>
        </form>

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
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleFAQ(index)}
                  >
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    {activeFAQ === index ? 
                      <ChevronDown className="h-5 w-5 text-muted-foreground" /> : 
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
                  <h3 className="font-bold text-lg mb-2">Before Donation</h3>
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