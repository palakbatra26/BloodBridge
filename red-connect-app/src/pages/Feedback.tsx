import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedbackForm } from "@/components/FeedbackForm";
import { FeedbackList } from "@/components/FeedbackList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Feedback() {
  const { t } = useTranslation();
  const [targetType, setTargetType] = useState<"hospital" | "camp" | "platform">("platform");
  const [targetId, setTargetId] = useState("platform");

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("feedback.title")}</h1>
          <p className="text-lg text-muted-foreground">
            Share your experience and help us improve our services
          </p>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
            <TabsTrigger value="view">View Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="submit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select What to Review</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={targetType} onValueChange={(value: any) => setTargetType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform">{t("feedback.platform")}</SelectItem>
                    <SelectItem value="hospital">{t("feedback.hospital")}</SelectItem>
                    <SelectItem value="camp">{t("feedback.camp")}</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <FeedbackForm
              targetType={targetType}
              targetId={targetId}
              targetName={
                targetType === "platform"
                  ? "BloodBridge Platform"
                  : targetType === "hospital"
                  ? "Hospital Name"
                  : "Blood Camp"
              }
            />
          </TabsContent>

          <TabsContent value="view">
            <FeedbackList targetType={targetType} targetId={targetId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
