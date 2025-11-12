import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Star, ThumbsUp, Trash2, Edit2, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

interface CampRatingSectionProps {
  campId: string;
  campName: string;
  campEnded?: boolean;
}

interface Feedback {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  review: string;
  helpful: number;
  createdAt: string;
}

export function CampRatingSection({ campId, campName, campEnded = false }: CampRatingSectionProps) {
  const { userId, getToken } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [campId]);

  const loadFeedback = async () => {
    try {
      const data = await api.getFeedbackByTarget("camp", campId);
      setFeedbacks(data.feedbacks || []);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    
    if (!review.trim()) {
      toast.error("Please write a review");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      if (editingId) {
        await api.updateFeedback(editingId, { rating, review }, token);
        toast.success("Review updated successfully!");
        setEditingId(null);
      } else {
        await api.createFeedback({
          targetType: "camp",
          targetId: campId,
          targetName: campName,
          rating,
          review,
          category: "overall"
        }, token);
        toast.success("Thank you for your feedback!");
      }
      
      setRating(0);
      setReview("");
      loadFeedback();
    } catch (error: any) {
      console.error("Feedback submission error:", error);
      toast.error(error.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (feedback: Feedback) => {
    setEditingId(feedback._id);
    setRating(feedback.rating);
    setReview(feedback.review);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setRating(0);
    setReview("");
  };

  const handleDeleteClick = (feedbackId: string) => {
    setFeedbackToDelete(feedbackId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;
    
    try {
      const token = await getToken();
      await api.deleteFeedback(feedbackToDelete, token);
      toast.success("Review deleted successfully");
      loadFeedback();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete review");
    } finally {
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const handleMarkHelpful = async (feedbackId: string) => {
    try {
      await api.markFeedbackHelpful(feedbackId);
      loadFeedback();
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    }
  };

  const userFeedback = feedbacks.find(f => f.userId === userId);
  const canSubmitReview = campEnded && !userFeedback && !editingId;
  const displayedFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 2);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  return (
    <div className="space-y-4 mt-6">
      {/* Average Rating Display */}
      {stats && stats.total > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {stats.averageRating}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(parseFloat(stats.averageRating))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {stats.total} {stats.total === 1 ? "review" : "reviews"}
                  </p>
                </div>
                
                <div className="flex-1 space-y-1">
                  {[5, 4, 3, 2, 1].map((ratingValue) => (
                    <div key={ratingValue} className="flex items-center gap-2 text-sm">
                      <span className="w-12 text-right">{ratingValue} ⭐</span>
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all duration-300"
                          style={{
                            width: `${
                              stats.total > 0
                                ? (stats.ratingDistribution[ratingValue] / stats.total) * 100
                                : 0
                            }%`
                          }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">
                        {stats.ratingDistribution[ratingValue]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form (only if camp ended and user hasn't reviewed) */}
      {campEnded && (canSubmitReview || editingId) && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">
                  {editingId ? "Edit Your Review" : "Rate This Camp"}
                </h3>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoveredRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your experience at this blood camp..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {review.length}/500 characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : editingId ? "Update Review" : "Submit Review"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {feedbacks.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Reviews</h3>
          {displayedFeedbacks.map((feedback) => (
            <Card key={feedback._id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{feedback.userName}</span>
                      <Badge variant="outline" className="text-xs">
                        {feedback.userEmail}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= feedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-muted-foreground ml-2">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mt-2">{feedback.review}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkHelpful(feedback._id)}
                        className="text-muted-foreground hover:text-primary"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({feedback.helpful})
                      </Button>
                      
                      {feedback.userId === userId && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(feedback)}
                            className="text-muted-foreground hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(feedback._id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* See More / See Less Button */}
          {feedbacks.length > 2 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  See Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  See More ({feedbacks.length - 2} more {feedbacks.length - 2 === 1 ? "review" : "reviews"})
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* No Reviews Yet */}
      {feedbacks.length === 0 && campEnded && (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>No reviews yet. Be the first to share your experience!</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
