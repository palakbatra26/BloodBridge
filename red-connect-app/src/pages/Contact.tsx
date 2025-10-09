import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Heart,
  Send,
  MessageSquare,
  Headphones,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "@/services/api";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email anytime",
      value: "palakbatra79@gmail.com",
      action: "mailto:palakbatra79@gmail.com"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Call us during business hours",
      value: "+91 7986904164",
      action: "tel:+917986904164"
    },
    {
      icon: MapPin,
      title: "Admin Location",
      description: "Our administrative office",
      value: "Ludhiana, Punjab, India",
      action: null
    },
    {
      icon: Clock,
      title: "Support Hours",
      description: "When we're available",
      value: "24/7 Emergency | 9 AM - 6 PM General",
      action: null
    }
  ];

  const supportTopics = [
    { icon: Heart, title: "Donor Support", description: "Questions about donating blood" },
    { icon: Users, title: "Recipient Help", description: "Need help finding blood" },
    { icon: MessageSquare, title: "Technical Issues", description: "Platform or app problems" },
    { icon: Headphones, title: "General Inquiry", description: "Other questions or feedback" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      await api.submitContactForm(formData);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
      });
      // Hide success message after 5 seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError("Failed to submit contact form. Please try again.");
      console.error("Error submitting contact form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            Get in Touch
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Contact <span className="text-primary">BloodBridge</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Have questions about blood donation or need help with our platform? We're here to help you save lives.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {submitSuccess && (
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-success font-medium">Message sent successfully! We'll get back to you soon.</p>
                  </div>
                )}
                
                {submitError && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive font-medium">{submitError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        placeholder="John" 
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        placeholder="Doe" 
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john.doe@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        className="pl-10"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      placeholder="How can we help you?" 
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your question or concern in detail..."
                      rows={6}
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {supportTopics.map((topic, index) => (
                      <button
                        key={index}
                        type="button"
                        className="p-4 rounded-lg border-2 border-border hover:border-primary/50 transition-smooth text-left group"
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                            <topic.icon className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium">{topic.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </button>
                    ))}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full gradient-hero text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-xl">Quick Contact</CardTitle>
                <CardDescription>
                  Reach out to us directly through these channels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <method.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-1">{method.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{method.description}</p>
                        {method.action ? (
                          <a
                            href={method.action}
                            className="text-primary hover:underline font-medium"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <span className="text-foreground font-medium">{method.value}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-0 shadow-card bg-destructive/5 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-xl text-destructive">Emergency Blood Request</CardTitle>
                <CardDescription>
                  For urgent blood requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-destructive/10 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-5 w-5 text-destructive" />
                      <span className="font-medium text-destructive">24/7 Emergency Hotline</span>
                    </div>
                    <a
                      href="tel:+917986904164"
                      className="text-lg font-bold text-destructive hover:underline"
                    >
                      +91 7986904164
                    </a>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Call this number for urgent blood requirements. Our emergency response team will connect you with the nearest available donors.
                  </p>
                  <Link to="/recipient-dashboard">
                    <Button className="w-full bg-destructive hover:bg-destructive/90 text-white">
                      Submit Emergency Request
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 text-center">
          <Card className="border-0 shadow-card max-w-4xl mx-auto">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">
                About BloodBridge Support
              </h3>
              <p className="text-muted-foreground mb-6">
                Our support team is dedicated to helping you with any questions about blood donation, 
                our platform, or connecting with our life-saving community. We understand that every 
                moment matters when it comes to saving lives, so we strive to provide quick, helpful, 
                and compassionate support.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">&lt; 1 Hour</div>
                  <p className="text-muted-foreground">Emergency Response Time</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">24/7</div>
                  <p className="text-muted-foreground">Critical Support Available</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success mb-1">99.9%</div>
                  <p className="text-muted-foreground">Support Satisfaction Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}