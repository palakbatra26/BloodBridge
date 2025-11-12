import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, ThumbsUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/services/api";

interface Feedback {
  _id: string;
  userName: string;
  rating: number;
  review: string;
  category: string;
  helpful: number;
  createdAt: string;
}

interface FeedbackListProps {
  targetType: string;
  targetId: string;
}

export function FeedbackList({ targetType, targetId }: FeedbackListProps) {
  const { t } = useTranslation();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeedback();
  }, [targetType, targetId]);

  const loadFeedback = async () => {
    try {
      const data = await api.getFeedbackByTarget(targetType, targetId);
      setFeedbacks(data.feedbacks);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div>{t("common.loading")}</div>;
  }

  return (
    <div className="space-y-4">
      {stats && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.averageRating}</div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(parseFloat(stats.averageRating))
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.total} {t("feedback.reviews")}
                </p>
              </div>
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center gap-2 text-sm">
                    <span className="w-8">{rating}★</span>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${
                            stats.total > 0
                              ? (stats.ratingDistribution[rating] / stats.total) * 100
                              : 0
                          }%`
                        }}
                      />
                    </div>
                    <span className="w-8 text-muted-foreground">
                      {stats.ratingDistribution[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {feedbacks.map((feedback) => (
          <Card key={feedback._id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{feedback.userName}</span>
                    <Badge variant="outline">{feedback.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
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
                  </div>
                  <p className="mt-2 text-sm">{feedback.review}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(feedback._id)}
                      className="text-muted-foreground"
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {t("feedback.helpful")} ({feedback.helpful})
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
