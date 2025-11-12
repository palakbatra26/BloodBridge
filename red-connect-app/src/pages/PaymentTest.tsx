import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, CreditCard, Wallet, Smartphone, Award } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { initiatePayment } from "@/services/razorpayService";
import { downloadReceipt } from "@/services/paymentService";

export default function PaymentTest() {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTestPayment = async (amount: number, description: string) => {
    setIsProcessing(true);
    try {
      // Create a more detailed description based on the amount
      let detailedDescription = description;
      if (amount === 1000) {
        detailedDescription = "Test payment - ₹10. Your donation helps provide refreshments for donors at blood camps.";
      } else if (amount === 5000) {
        detailedDescription = "Test payment - ₹50. Your donation helps support transportation for emergency cases.";
      } else if (amount === 10000) {
        detailedDescription = "Test payment - ₹100. Your donation helps organize small blood donation camps.";
      } else {
        detailedDescription = `Test payment - ₹${(amount/100).toFixed(0)}. Your donation helps organize blood camps, maintain our technology platform, provide refreshments for donors, and support transportation for emergency cases.`;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_example123',
        amount: amount, // Amount in paise
        currency: "INR",
        name: "BloodBridge - Payment Test",
        description: detailedDescription,
        image: "/logo.png",
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
        },
        notes: {
          address: "BloodBridge Foundation - Test Payment",
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
          alert("Test payment successful! Payment ID: " + response.razorpay_payment_id);
          
          // Generate and download receipt
          downloadReceipt(
            response.razorpay_payment_id,
            amount,
            user?.fullName || "Test User",
            user?.primaryEmailAddress?.emailAddress || "test@example.com"
          );
          
          setIsProcessing(false);
        },
        (error) => {
          // Payment failed or error occurred
          console.error("Payment error:", error);
          alert("Test payment failed. Please try again.");
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Failed to initiate test payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Payment Method Test</h1>
          <p className="text-muted-foreground">
            Test all available payment methods including Google Pay, Paytm, and other UPI options
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-primary" />
                Payment Options
              </CardTitle>
              <CardDescription>
                All payment methods should be available during checkout
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">UPI Payments</h3>
                  <p className="text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, etc.</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <CreditCard className="h-5 w-5 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Credit/Debit Cards</h3>
                  <p className="text-sm text-muted-foreground">All major card providers</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <Wallet className="h-5 w-5 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Wallets</h3>
                  <p className="text-sm text-muted-foreground">Paytm, PhonePe, Amazon Pay, etc.</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-muted/50 rounded-lg">
                <IndianRupee className="h-5 w-5 text-primary mr-3" />
                <div>
                  <h3 className="font-medium">Net Banking</h3>
                  <p className="text-sm text-muted-foreground">All major banks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <CardTitle>Test Payments</CardTitle>
              <CardDescription>
                Try different amounts to verify all payment methods work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full py-6 text-lg"
                disabled={isProcessing}
                onClick={() => handleTestPayment(1000, "Test payment - ₹10")}
              >
                {isProcessing ? "Processing..." : "Test ₹10 Payment"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full py-6"
                disabled={isProcessing}
                onClick={() => handleTestPayment(5000, "Test payment - ₹50")}
              >
                {isProcessing ? "Processing..." : "Test ₹50 Payment"}
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full py-6"
                disabled={isProcessing}
                onClick={() => handleTestPayment(10000, "Test payment - ₹100")}
              >
                {isProcessing ? "Processing..." : "Test ₹100 Payment"}
              </Button>
              
              <div className="pt-4 text-xs text-muted-foreground">
                <p className="mb-2">Note: This is a test page to verify payment methods.</p>
                <p>All payments use Razorpay's test mode and no real money will be charged.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How Your Donation Helps</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Impact of Your Contribution</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <Award className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>₹50</strong> - Provides refreshments for 5 blood donors</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>₹100</strong> - Supports transportation for emergency cases</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>₹500</strong> - Organizes a small blood donation camp</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span><strong>₹1000</strong> - Maintains our technology platform for a month</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Fund Distribution</h3>
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
        </div>
      </div>
    </div>
  );
}