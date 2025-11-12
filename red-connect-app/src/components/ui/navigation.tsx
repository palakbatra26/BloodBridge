import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X, User, Users, Building2, Shield, LogOut, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadReceipt } from "@/services/paymentService";
import { initiatePayment } from "@/services/razorpayService";
import { ThemeToggle } from "@/components/ui/theme-toggle";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/blood-camps", label: "Blood Camps" },
    { href: "/register-donor", label: "Register as Donor" },
    { href: "/contact", label: "Contact" },
  ];

  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Function to handle donation
  const handleDonation = async () => {
    try {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_example123',
        amount: 50000, // Amount in paise (50000 paise = ₹500)
        currency: "INR",
        name: "BloodBridge",
        description: "Support our blood donation platform. Your donation helps organize blood camps, maintain our technology platform, provide refreshments for donors, and support transportation for emergency cases.",
        image: "/logo.png",
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        notes: {
          address: "BloodBridge Foundation",
          purpose: "Blood donation platform support"
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
            50000, // amount in paise
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

  const handleSignout = async () => {
    try {
      await signOut();
      navigate("/auth?tab=signin");
    } catch (error) {
      console.error("Signout error:", error);
      navigate("/auth?tab=signin");
    }
    setIsOpen(false);
  };

  // Show loading state while auth state is loading
  if (!isLoaded) {
    return (
      <nav className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-bold text-foreground">BloodBridge</span>
            </Link>
            
            {/* Loading placeholder for auth buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
              <div className="h-10 w-24 bg-muted rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isSignedIn ? "/" : "/auth?tab=signin"} className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">BloodBridge</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={isSignedIn ? item.href : "/auth?tab=signin"}
                className={cn(
                  "text-muted-foreground hover:text-primary transition-smooth relative py-2",
                  location.pathname === item.href && "text-primary font-medium"
                )}
              >
                {item.label}
                {location.pathname === item.href && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth/Admin Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Donate Button */}
            <Button 
              variant="outline" 
              className="flex items-center space-x-2 border-primary text-primary hover:bg-primary/10"
              onClick={handleDonation}
            >
              <IndianRupee className="h-4 w-4" />
              <span>Donate</span>
            </Button>
            
            {isSignedIn ? (
              // User is authenticated
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link to="/admin-dashboard">
                    <Button variant="outline" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}
                
                <Button variant="outline" onClick={handleSignout} className="flex items-center space-x-2">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              // User is not authenticated
              <>
                <Link to="/auth?tab=signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/auth?tab=signup">
                  <Button className="gradient-hero text-white">Join Now</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-4 pb-4 fade-in">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={isSignedIn ? item.href : "/auth?tab=signin"}
                  className={cn(
                    "block px-3 py-2 text-muted-foreground hover:text-primary transition-smooth",
                    location.pathname === item.href && "text-primary font-medium bg-muted/50 rounded-md"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Donate Button */}
              <button
                className="w-full flex items-center px-3 py-2 text-muted-foreground hover:text-primary transition-smooth"
                onClick={() => {
                  setIsOpen(false);
                  handleDonation();
                }}
              >
                <IndianRupee className="h-4 w-4 mr-2" />
                Donate
              </button>
              
              {isAdmin && (
                <Link
                  to="/admin-dashboard"
                  className={cn(
                    "block px-3 py-2 text-muted-foreground hover:text-primary transition-smooth",
                    location.pathname === "/admin-dashboard" && "text-primary font-medium bg-muted/50 rounded-md"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
              )}
              
              <div className="pt-4 space-y-2">
                {isSignedIn ? (
                  // User is authenticated
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center space-x-2"
                    onClick={handleSignout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </Button>
                ) : (
                  // User is not authenticated
                  <>
                    <Link to="/auth?tab=signin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                    <Link to="/auth?tab=signup" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gradient-hero text-white">Join Now</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}