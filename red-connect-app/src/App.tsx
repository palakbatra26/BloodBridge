import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/ui/navigation";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import BloodCamps from "./pages/BloodCamps";
import RegisterDonor from "./pages/RegisterDonor";
// Removed RegisterCamp import
import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentTest from "./pages/PaymentTest";
import NotFound from "./pages/NotFound";

// Protected route component using Clerk
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return isSignedIn ? children : <Navigate to="/auth?tab=signin" replace />;
};

// Redirect authenticated users away from auth page
const AuthRedirect = ({ children }: { children: JSX.Element }) => {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) {
    return <div>Loading...</div>;
  }
  
  return isSignedIn ? <Navigate to="/" replace /> : children;
};

const queryClient = new QueryClient();

// Import your publishable key
const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_b3Blbi1zcXVpZC03NS5jbGVyay5hY2NvdW50cy5kZXYk";

const App = () => (
  <ClerkProvider publishableKey={publishableKey}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navigation />
          <Routes>
            {/* Protected root route - only authenticated users can see the home page */}
            <Route path="/" element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } />
            <Route path="/auth" element={
              <AuthRedirect>
                <Auth />
              </AuthRedirect>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            } />
            <Route path="/blood-camps" element={
              <ProtectedRoute>
                <BloodCamps />
              </ProtectedRoute>
            } />
            <Route path="/register-donor" element={
              <ProtectedRoute>
                <RegisterDonor />
              </ProtectedRoute>
            } />
            {/* Removed RegisterCamp route */}
            <Route path="/donor-dashboard" element={
              <ProtectedRoute>
                <DonorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/recipient-dashboard" element={
              <ProtectedRoute>
                <RecipientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/hospital-dashboard" element={
              <ProtectedRoute>
                <HospitalDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/payment-test" element={
              <ProtectedRoute>
                <PaymentTest />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;