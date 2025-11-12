import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./providers/theme-provider.tsx";
import { AccessibilityProvider } from "./providers/accessibility-provider.tsx";
import "./i18n/config";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="system" storageKey="bloodbridge-theme">
    <AccessibilityProvider>
      <App />
    </AccessibilityProvider>
  </ThemeProvider>
);