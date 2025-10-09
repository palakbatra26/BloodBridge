import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { ClerkSignIn } from "@/components/ClerkSignIn";
import { ClerkSignUp } from "@/components/ClerkSignUp";

export default function Auth() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "signin";

  // If tab is signin, show ClerkSignIn component
  if (tab === "signin") {
    return <ClerkSignIn />;
  }

  // If tab is signup, show ClerkSignUp component
  if (tab === "signup") {
    return <ClerkSignUp />;
  }

  // Default fallback
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
        
        <Card className="shadow-hero border-0 p-8 text-center">
          <CardHeader>
            <CardTitle>Select Authentication Option</CardTitle>
            <CardDescription>
              Choose how you'd like to access your BloodBridge account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link to="/auth?tab=signin">
              <Button className="w-full gradient-hero text-white">
                Sign In
              </Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button variant="outline" className="w-full">
                Sign Up
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
