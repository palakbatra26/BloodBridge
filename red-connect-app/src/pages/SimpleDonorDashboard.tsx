import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Edit, Save, X } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SimpleDonorDashboard() {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.fullName || "",
    bloodType: "O+",
    city: ""
  });

  if (!isLoaded) {
    return <div className="min-h-screen bg-muted/30 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!isSignedIn) {
    navigate("/auth?tab=signin");
    return null;
  }

  const handleSave = () => {
    toast.success("Profile updated!");
    setIsEditing(false);
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="min-h-screen bg-muted/30 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Donor Profile</h1>
          <Button variant="outline" onClick={() => signOut()}>Logout</Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />My Profile</CardTitle>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}><Edit className="h-4 w-4 mr-2" />Edit</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-muted-foreground">Name</Label><p className="text-lg font-medium">{profile.name || "Not set"}</p></div>
                <div><Label className="text-muted-foreground">Blood Type</Label><p className="text-lg font-medium text-primary">{profile.bloodType}</p></div>
                <div><Label className="text-muted-foreground">City</Label><p className="text-lg font-medium">{profile.city || "Not set"}</p></div>
                <div><Label className="text-muted-foreground">Email</Label><p className="text-lg font-medium">{user?.primaryEmailAddress?.emailAddress}</p></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div><Label>Name</Label><Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} placeholder="Enter name" /></div>
                <div><Label>Blood Type</Label><Select value={profile.bloodType} onValueChange={(value) => setProfile({...profile, bloodType: value})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{bloodTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div>
                <div><Label>City</Label><Input value={profile.city} onChange={(e) => setProfile({...profile, city: e.target.value})} placeholder="Enter city" /></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
