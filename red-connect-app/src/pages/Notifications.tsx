import { useTranslation } from "react-i18next";
import { NotificationCenter } from "@/components/NotificationCenter";

export default function Notifications() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t("notifications.title")}</h1>
          <p className="text-lg text-muted-foreground">
            Stay updated with blood camps and urgent requests near you
          </p>
        </div>

        <NotificationCenter />
      </div>
    </div>
  );
}
