import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  User, 
  Mail, 
  Phone,
  Clock,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PendingCamp {
  _id: string;
  name: string;
  organizer: string;
  contactEmail: string;
  contactPhone: string;
  location: string;
  date: string;
  time: string;
  description: string;
  status: string;
  createdAt: string;
}

export function CampApprovalSection() {
  const { getToken } = useAuth();
  const [pendingCamps, setPendingCamps] = useState<PendingCamp[]>([]);
  const [filteredCamps, setFilteredCamps] = useState<PendingCamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "recent">("recent");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | null;
    campId: string | null;
    campName: string;
  }>({
    open: false,
    action: null,
    campId: null,
    campName: ""
  });

  useEffect(() => {
    loadPendingCamps();
  }, []);

  useEffect(() => {
    filterAndSortCamps();
  }, [pendingCamps, searchQuery, sortBy]);

  const loadPendingCamps = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const camps = await api.getPendingCamps(token);
      setPendingCamps(camps);
    } catch (error) {
      console.error("Failed to load pending camps:", error);
      toast.error("Failed to load pending camps");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortCamps = () => {
    let filtered = [...pendingCamps];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        camp =>
          camp.name.toLowerCase().includes(query) ||
          camp.organizer.toLowerCase().includes(query) ||
          camp.location.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "recent":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredCamps(filtered);
  };

  const handleActionClick = (action: "approve" | "reject", campId: string, campName: string) => {
    setActionDialog({
      open: true,
      action,
      campId,
      campName
    });
  };

  const handleConfirmAction = async () => {
    if (!actionDialog.campId || !actionDialog.action) return;

    try {
      const token = await getToken();
      
      if (actionDialog.action === "approve") {
        await api.approveCamp(actionDialog.campId, token);
        toast.success(`Camp "${actionDialog.campName}" approved successfully!`);
      } else {
        await api.rejectCamp(actionDialog.campId, token);
        toast.success(`Camp "${actionDialog.campName}" rejected`);
      }

      loadPendingCamps();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${actionDialog.action} camp`);
    } finally {
      setActionDialog({ open: false, action: null, campId: null, campName: "" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "Time not specified";
    return timeString;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-3xl font-bold">{pendingCamps.length}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Filtered Results</p>
                <p className="text-3xl font-bold">{filteredCamps.length}</p>
              </div>
              <Filter className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Awaiting Action</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingCamps.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by camp name, organizer, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="date">Camp Date</SelectItem>
                <SelectItem value="name">Camp Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Camps List */}
      {filteredCamps.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              {pendingCamps.length === 0
                ? "No pending camp requests at the moment."
                : "No camps match your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredCamps.map((camp) => (
            <Card key={camp._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{camp.name}</CardTitle>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Pending Approval
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleActionClick("approve", camp._id, camp.name)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleActionClick("reject", camp._id, camp.name)}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Organizer</p>
                        <p className="text-sm text-muted-foreground">{camp.organizer}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href={`mailto:${camp.contactEmail}`} className="text-sm text-primary hover:underline">
                          {camp.contactEmail}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Contact</p>
                        <a href={`tel:${camp.contactPhone}`} className="text-sm text-primary hover:underline">
                          {camp.contactPhone}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">{camp.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(camp.date)} at {formatTime(camp.time)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(camp.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {camp.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{camp.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionDialog.action === "approve" ? "Approve Camp" : "Reject Camp"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionDialog.action === "approve" ? (
                <>
                  Are you sure you want to approve <strong>"{actionDialog.campName}"</strong>?
                  <br />
                  <br />
                  This camp will be published and visible to all users on the Blood Camps page.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>"{actionDialog.campName}"</strong>?
                  <br />
                  <br />
                  This action will permanently delete the camp request.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={actionDialog.action === "approve" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {actionDialog.action === "approve" ? "Approve Camp" : "Reject Camp"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
