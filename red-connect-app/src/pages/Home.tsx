import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Heart, 
  Users, 
  Droplets, 
  Building2, 
  Bell, 
  MapPin, 
  Activity,
  ArrowRight,
  Calendar,
  Award,
  Shield,
  ChevronDown,
  ChevronRight,
  Instagram
} from "lucide-react";
import heroImage from "@/assets/hero-blood-donation.jpg";
import featuresImage from "@/assets/features-medical.jpg";
import dashboardImage from "@/assets/dashboard-illustration.jpg";
import { useUser } from "@clerk/clerk-react";

export default function Home() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null); // Added for FAQ toggle

  // FAQ data
  const faqs = [
    {
      question: "Who can donate blood?",
      answer: "Healthy individuals aged 18-65 years weighing at least 50kg can donate blood. You should be free from any chronic illness and not have donated blood in the last 3 months."
    },
    {
      question: "How often can I donate?",
      answer: "You can donate whole blood every 3 months (4 times a year). For platelet donations, you can donate every 2 weeks."
    },
    {
      question: "Is blood donation safe?",
      answer: "Yes, blood donation is safe. All equipment is sterile and used only once. The process takes about 10-15 minutes and is supervised by trained medical professionals."
    },
    {
      question: "How long does it take to recover?",
      answer: "Your body replaces the blood volume (plasma) within 24 hours. Red blood cells take about 4-6 weeks to completely replenish."
    },
    {
      question: "What should I do before donating?",
      answer: "Eat a healthy meal and drink plenty of fluids before donation. Get a good night's sleep and avoid alcohol for 24 hours before donation."
    },
    {
      question: "How can I find blood camps?",
      answer: "Check our Blood Camps page for upcoming events near you. You can also register to be notified when camps are organized in your area."
    }
  ];

  const features = [
    {
      icon: Users,
      title: "Donor Management",
      description: "Complete donor registration with eligibility checking and profile management",
      color: "bg-primary/10 text-primary"
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      description: "Instant notifications for urgent blood requests and donation opportunities",
      color: "bg-accent/10 text-accent"
    },
    {
      icon: MapPin,
      title: "Blood Camp Locator",
      description: "Find nearby blood donation camps with integrated Google Maps",
      color: "bg-warning/10 text-warning"
    }
  ];

  const stats = [
    { icon: Users, label: "Active Donors", value: "25,000+", color: "text-primary" },
    { icon: Droplets, label: "Units Donated", value: "50,000+", color: "text-accent" },
    { icon: Building2, label: "Partner Hospitals", value: "150+", color: "text-success" },
    { icon: Activity, label: "Lives Saved", value: "100,000+", color: "text-warning" }
  ];

  const userTypes = [
    {
      title: "Blood Donors",
      description: "Join our community of life-savers. Track your donations, earn rewards, and get notified about urgent needs.",
      icon: Heart,
      features: ["Donation History", "Reward Points", "Urgent Alerts", "Health Tracking"],
      href: "/donor-dashboard",
      gradient: "gradient-hero"
    },
    {
      title: "Recipients & Families",
      description: "Find blood when you need it most. Submit requests and get connected with compatible donors quickly.",
      icon: Users,
      features: ["Blood Requests", "Real-time Matching", "Hospital Network", "24/7 Support"],
      href: "/recipient-dashboard",
      gradient: "gradient-accent"
    },
    {
      title: "Hospitals & Blood Banks",
      description: "Manage your blood inventory efficiently. Track supplies, coordinate camps, and connect with donors.",
      icon: Building2,
      features: ["Inventory Management", "Camp Organization", "Donor Database"],
      href: "/hospital-dashboard",
      gradient: "gradient-card"
    }
  ];

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

  // Show loading state while auth state is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                Saving Lives Through Technology
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Connect <span className="text-primary">Blood Donors</span> & Recipients
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                BloodBridge is a revolutionary platform that connects donors, recipients, hospitals, and blood banks in real-time. Join our mission to save lives through efficient blood donation management.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {isSignedIn ? (
                  <Link to="/donor-dashboard">
                    <Button size="lg" className="gradient-hero text-white shadow-hero group">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/auth?tab=signin">
                    <Button size="lg" className="gradient-hero text-white shadow-hero group">
                      Start Saving Lives
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-smooth" />
                    </Button>
                  </Link>
                )}
                <Link to="/blood-camps">
                  <Button size="lg" variant="outline" className="shadow-soft">
                    Find Blood Camps
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative slide-up">
              <div className="relative rounded-2xl overflow-hidden shadow-hero">
                <img 
                  src={heroImage} 
                  alt="Blood donation hero" 
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`inline-flex p-3 rounded-lg bg-background shadow-soft mb-4 ${stat.color}`}>
                  <stat.icon className="h-8 w-8" />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Platform Features
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You Need for <span className="text-primary">Blood Donation</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools needed for efficient blood donation management, from donor registration to real-time analytics.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-hero transition-smooth fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-lg mb-4 ${feature.color}`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Who We Serve
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Built for Every <span className="text-primary">Stakeholder</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Whether you're a donor, recipient, or healthcare provider, BloodBridge has specialized tools designed for your needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {userTypes.map((type, index) => (
              <Card key={index} className="border-0 shadow-card hover:shadow-hero transition-smooth fade-in group" style={{ animationDelay: `${index * 0.2}s` }}>
                <CardContent className="p-8">
                  <div className={`inline-flex p-4 rounded-xl mb-6 ${type.gradient} shadow-soft`}>
                    <type.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-4">{type.title}</h3>
                  <p className="text-muted-foreground mb-6">{type.description}</p>
                  
                  <div className="space-y-3 mb-6">
                    {type.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <Award className="h-5 w-5 text-accent" />
                        <span className="text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link to={isSignedIn ? type.href : "/auth?tab=signin"}>
                    <Button className="w-full group-hover:scale-105 transition-bounce">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-accent/10 text-accent border-accent/20">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Everything You <span className="text-primary">Need to Know</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about blood donation and our platform.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-card">
              <CardContent className="space-y-4 p-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to Save Lives?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of donors and healthcare providers who trust BloodBridge for their blood donation needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isSignedIn ? (
                <Link to="/donor-dashboard">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth?tab=signin">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-hero">
                    Join as Donor
                  </Button>
                </Link>
              )}
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xl font-bold text-foreground">BloodBridge</span>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Connecting blood donors with recipients in real-time to save lives. 
                Our platform makes blood donation management efficient and accessible for everyone.
              </p>
              <p className="text-muted-foreground text-sm">
                Made with <span className="text-red-500">❤</span> by Palak Batra and her team 
                under the guidance of Dr. Palwinder Kaur
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to={isSignedIn ? "/" : "/auth?tab=signin"} className="text-muted-foreground hover:text-primary transition-smooth">Home</Link></li>
                <li><Link to={isSignedIn ? "/blood-camps" : "/auth?tab=signin"} className="text-muted-foreground hover:text-primary transition-smooth">Blood Camps</Link></li>
                <li><Link to={isSignedIn ? "/register-donor" : "/auth?tab=signin"} className="text-muted-foreground hover:text-primary transition-smooth">Register as Donor</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Follow us on Instagram</h3>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/palakbatra26_/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-primary/10 rounded-lg hover:bg-primary/20 transition-smooth"
                >
                  <Instagram className="h-6 w-6 text-primary" />
                </a>
              </div>
              <div className="mt-6">
                <h4 className="text-md font-semibold text-foreground mb-2">Contact Us</h4>
                <p className="text-muted-foreground text-sm">
                  For support and inquiries:<br/>
                  <a href="mailto:support@bloodbridge.com" className="text-primary hover:underline">support@bloodbridge.com</a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} BloodBridge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}