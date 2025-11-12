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
  Instagram,
  IndianRupee
} from "lucide-react";
import heroImage from "@/assets/hero-blood-donation.jpg";
import featuresImage from "@/assets/features-medical.jpg";
import dashboardImage from "@/assets/dashboard-illustration.jpg";
import { useUser } from "@clerk/clerk-react";

// Rotating Facts Component
function RotatingFactsSection() {
  const [currentFactSet, setCurrentFactSet] = useState(0);

  const factSets = [
    // Set 1: Life-Saving Impact
    {
      title: "Life-Saving Impact",
      badge: "Amazing Facts",
      facts: [
        {
          icon: Heart,
          gradient: "gradient-hero",
          number: "3 Lives",
          title: "Saved Per Donation",
          description: "A single blood donation can save up to three lives. Your one hour can give someone a lifetime.",
          color: "text-primary"
        },
        {
          icon: Activity,
          gradient: "gradient-accent",
          number: "2 Seconds",
          title: "Someone Needs Blood",
          description: "Every 2 seconds, someone in the world needs blood. Your donation could be the difference between life and death.",
          color: "text-accent"
        },
        {
          icon: Droplets,
          gradient: "gradient-card",
          number: "36,000",
          title: "Units Needed Daily",
          description: "36,000 units of red blood cells are needed every day in the US alone. Be part of the solution.",
          color: "text-warning"
        }
      ],
      quote: "The blood you donate gives someone another chance at life. One day that someone may be a close relative, a friend, a loved one—or even you."
    },
    // Set 2: Health & Recovery
    {
      title: "Health & Recovery",
      badge: "Did You Know?",
      facts: [
        {
          icon: Activity,
          gradient: "gradient-hero",
          number: "24 Hours",
          title: "Plasma Replenishment",
          description: "Your body replaces the donated plasma within 24 hours. You'll be back to normal in no time!",
          color: "text-primary"
        },
        {
          icon: Heart,
          gradient: "gradient-accent",
          number: "650 Calories",
          title: "Burned Per Donation",
          description: "Donating blood burns approximately 650 calories. It's healthy for you and saves lives!",
          color: "text-accent"
        },
        {
          icon: Shield,
          gradient: "gradient-card",
          number: "100% Safe",
          title: "Sterile Equipment",
          description: "All equipment is sterile and used only once. Blood donation is completely safe with trained professionals.",
          color: "text-warning"
        }
      ],
      quote: "Be a hero. Donate blood. Save lives. It's that simple."
    },
    // Set 3: Community Impact
    {
      title: "Community Impact",
      badge: "Make a Difference",
      facts: [
        {
          icon: Users,
          gradient: "gradient-hero",
          number: "Only 3%",
          title: "Of People Donate",
          description: "Only 3% of eligible people donate blood annually. Imagine the impact if more people donated!",
          color: "text-primary"
        },
        {
          icon: Building2,
          gradient: "gradient-accent",
          number: "1 in 7",
          title: "Hospital Patients",
          description: "1 in 7 people entering a hospital needs blood. Your donation could help someone you know.",
          color: "text-accent"
        },
        {
          icon: Calendar,
          gradient: "gradient-card",
          number: "Every 3 Months",
          title: "Donation Frequency",
          description: "You can safely donate whole blood every 3 months. That's 4 times a year to save 12 lives!",
          color: "text-warning"
        }
      ],
      quote: "Not all heroes wear capes. Some roll up their sleeves and donate blood."
    },
    // Set 4: Blood Types & Compatibility
    {
      title: "Blood Types Matter",
      badge: "Know Your Type",
      facts: [
        {
          icon: Droplets,
          gradient: "gradient-hero",
          number: "O-Negative",
          title: "Universal Donor",
          description: "O-negative blood can be given to anyone. Only 7% of people have this rare and precious blood type.",
          color: "text-primary"
        },
        {
          icon: Heart,
          gradient: "gradient-accent",
          number: "AB-Positive",
          title: "Universal Receiver",
          description: "AB-positive can receive any blood type. Only 3% of people have this blood type.",
          color: "text-accent"
        },
        {
          icon: Activity,
          gradient: "gradient-card",
          number: "8 Types",
          title: "Blood Groups",
          description: "There are 8 main blood types. Every type is needed and every donation matters.",
          color: "text-warning"
        }
      ],
      quote: "Your blood type doesn't matter. What matters is your willingness to help."
    },
    // Set 5: Emergency & Medical
    {
      title: "Emergency Needs",
      badge: "Critical Facts",
      facts: [
        {
          icon: Activity,
          gradient: "gradient-hero",
          number: "100 Units",
          title: "Car Accident Victim",
          description: "A single car accident victim can require up to 100 units of blood. Your donation saves lives in emergencies.",
          color: "text-primary"
        },
        {
          icon: Heart,
          gradient: "gradient-accent",
          number: "5 Days",
          title: "Platelet Shelf Life",
          description: "Platelets have a shelf life of only 5 days. Constant donations are needed for cancer patients.",
          color: "text-accent"
        },
        {
          icon: Users,
          gradient: "gradient-card",
          number: "4.5 Million",
          title: "Americans Need Blood",
          description: "4.5 million Americans need blood transfusions each year. Be part of their survival story.",
          color: "text-warning"
        }
      ],
      quote: "Blood donation: Where a small act of kindness creates a lifetime of gratitude."
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactSet((prev) => (prev + 1) % factSets.length);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  const currentSet = factSets[currentFactSet];

  return (
    <>
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
          {currentSet.badge}
        </Badge>
        <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
          {currentSet.title.split(' ')[0]} <span className="text-primary">{currentSet.title.split(' ').slice(1).join(' ')}</span>
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Every donation makes a difference. Here are some amazing facts about blood donation.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {currentSet.facts.map((fact, index) => (
          <Card key={index} className="border-0 shadow-card hover:shadow-hero transition-smooth fade-in group">
            <CardContent className="p-8 text-center">
              <div className={`inline-flex p-4 rounded-xl mb-6 ${fact.gradient} shadow-soft`}>
                <fact.icon className="h-12 w-12 text-white" />
              </div>
              <h3 className={`text-4xl font-bold ${fact.color} mb-4`}>{fact.number}</h3>
              <p className="text-lg text-foreground font-semibold mb-3">{fact.title}</p>
              <p className="text-muted-foreground">
                {fact.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Inspirational Quote */}
      <Card className="border-0 shadow-card mt-12 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="text-6xl text-primary mb-6">"</div>
            <p className="text-2xl font-medium text-foreground mb-6 leading-relaxed">
              {currentSet.quote}
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              <span className="text-muted-foreground">Every drop counts. Every donor matters.</span>
              <Heart className="h-5 w-5 text-primary fill-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {factSets.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentFactSet(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentFactSet 
                ? 'w-8 bg-primary' 
                : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
            }`}
            aria-label={`Go to fact set ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [activeFAQ, setActiveFAQ] = useState<number | null>(null); // Added for FAQ toggle

  // Function to handle donation
  const handleDonation = async (amount: number = 50000, description: string = "Support our blood donation platform") => {
    try {
      // Dynamically import the razorpayService to avoid issues with the Razorpay global
      const { initiatePayment } = await import('@/services/razorpayService');
      const { downloadReceipt } = await import('@/services/paymentService');
      
      // Create a more detailed description based on the amount
      let detailedDescription = description;
      if (amount === 10000) {
        detailedDescription = "Support our blood donation platform - ₹100. Your donation helps provide refreshments for donors at blood camps.";
      } else if (amount === 50000) {
        detailedDescription = "Support our blood donation platform - ₹500. Your donation helps organize blood camps and maintain our technology platform.";
      } else if (amount === 100000) {
        detailedDescription = "Support our blood donation platform - ₹1000. Your donation helps support transportation for emergency cases and maintain our platform.";
      } else {
        detailedDescription = `Support our blood donation platform. Your donation of ₹${(amount/100).toFixed(0)} helps organize blood camps, maintain our technology platform, provide refreshments for donors, and support transportation for emergency cases.`;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_example123',
        amount: amount, // Amount in paise
        currency: "INR",
        name: "BloodBridge",
        description: detailedDescription,
        image: "/logo.png",
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        notes: {
          address: "BloodBridge Foundation",
          purpose: "Blood donation platform support",
          amount: (amount/100).toFixed(0) + " INR"
        },
        theme: {
          color: "#dc2626"
        }
      };

      initiatePayment(
        options,
        (response) => {
          // Payment successful
          alert("Thank you for your donation! Payment ID: " + response.razorpay_payment_id);
          
          // Generate and download receipt
          downloadReceipt(
            response.razorpay_payment_id,
            amount,
            user?.fullName || "Anonymous Donor",
            user?.primaryEmailAddress?.emailAddress || "N/A"
          );
        },
        (error) => {
          // Payment failed or error occurred
          console.error("Payment error:", error);
          alert("Payment failed. Please try again.");
        }
      );
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

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

      {/* Donation Section - NEW */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Support Our Cause
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Help Us <span className="text-primary">Save More Lives</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Your contribution helps us maintain our platform, organize blood camps, and support those in need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h3 className="text-2xl font-semibold text-foreground mb-4">How Your Donation Helps</h3>
              <p className="text-muted-foreground mb-6">
                Every rupee you donate directly contributes to saving lives through our blood donation platform.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground"><strong>₹50</strong> - Provides refreshments for 5 blood donors</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground"><strong>₹100</strong> - Supports transportation for emergency cases</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground"><strong>₹500</strong> - Organizes a small blood donation camp</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Award className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground"><strong>₹1000</strong> - Maintains our technology platform for a month</span>
                </li>
              </ul>
              
              <div className="bg-card border border-border rounded-lg p-6 mt-8">
                <h4 className="font-semibold text-foreground mb-3">Where Your Money Goes</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Blood Camp Organization</span>
                    <span>40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technology Platform</span>
                    <span>30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Donor Support & Refreshments</span>
                    <span>20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emergency Transportation</span>
                    <span>10%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="slide-up">
              <Card className="border-0 shadow-card p-8 text-center">
                <CardContent className="p-0">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-6">
                    <IndianRupee className="h-12 w-12 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Make a Donation</h3>
                  <p className="text-muted-foreground mb-6">
                    Your contribution, no matter how small, makes a big difference in saving lives.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <Button 
                        variant="outline" 
                        className="py-6"
                        onClick={() => {
                          handleDonation(10000, "Support our blood donation platform - ₹100");
                        }}
                      >
                        ₹100
                      </Button>
                      <Button 
                        variant="outline" 
                        className="py-6"
                        onClick={() => {
                          handleDonation(50000, "Support our blood donation platform - ₹500");
                        }}
                      >
                        ₹500
                      </Button>
                      <Button 
                        variant="outline" 
                        className="py-6"
                        onClick={() => {
                          handleDonation(100000, "Support our blood donation platform - ₹1000");
                        }}
                      >
                        ₹1000
                      </Button>
                    </div>
                    
                    <Button 
                      size="lg" 
                      className="w-full gradient-hero text-white py-6 text-lg"
                      onClick={() => handleDonation()}
                    >
                      Donate Custom Amount
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-4">
                    Secured payment powered by Razorpay. You will be redirected to a secure payment gateway.
                    <br />A receipt will be automatically downloaded after successful payment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Rotating Blood Donation Facts & Quotes Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RotatingFactsSection />
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