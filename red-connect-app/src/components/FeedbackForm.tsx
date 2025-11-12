import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/services/api";

interface FeedbackFormProps {
  targetType: "hospital" | "camp" | "platform";
  targetId?: string;
  targetName: string;
  onSuccess?: () => void;
}

export function FeedbackForm({ targetType, targetId, targetName, onSuccess }: FeedbackFormProps) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [category, setCategory] = useState("overall");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await api.createFeedback({
        targetType,
        targetId: targetId || "platform",
        targetName,
        rating,
        review,
        category
      });
      
      toast.success(t("feedback.submit") + " " + t("common.success"));
      setRating(0);
      setReview("");
      setCategory("overall");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("feedback.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t("feedback.rate")}</Label>
            <div className="flex gap-2 mt-2">
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
            <Label htmlFor="category">{t("feedback.category")}</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">{t("feedback.overall")}</SelectItem>
                <SelectItem value="service">{t("feedback.service")}</SelectItem>
                <SelectItem value="cleanliness">{t("feedback.cleanliness")}</SelectItem>
                <SelectItem value="staff">{t("feedback.staff")}</SelectItem>
                <SelectItem value="facilities">{t("feedback.facilities")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="review">{t("feedback.writeReview")}</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {review.length}/1000 characters
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? t("common.loading") : t("feedback.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
