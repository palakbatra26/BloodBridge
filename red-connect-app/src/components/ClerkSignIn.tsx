import { SignIn } from "@clerk/clerk-react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

export function ClerkSignIn() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-6 group">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-smooth">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">BloodBridge</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to BloodBridge</h1>
          <p className="text-muted-foreground">Join our life-saving community</p>
        </div>
        
        <Card className="shadow-hero border-0">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-hero border-0 w-full",
                headerTitle: "text-2xl font-bold text-foreground",
                headerSubtitle: "text-muted-foreground",
                socialButtonsBlockButton: "gradient-hero text-white",
                formButtonPrimary: "gradient-hero text-white w-full",
                footerActionLink: "text-primary hover:underline"
              }
            }}
            signUpUrl="/auth?tab=signup"
          />
        </Card>
      </div>
    </div>
  );
}