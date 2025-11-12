import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  textToSpeech: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleTextToSpeech: () => void;
  speakText: (text: string) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [textToSpeech, setTextToSpeech] = useState(false);

  // Apply accessibility settings to the document
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add("high-contrast");
    } else {
      document.body.classList.remove("high-contrast");
    }

    if (largeText) {
      document.body.classList.add("large-text");
    } else {
      document.body.classList.remove("large-text");
    }
  }, [highContrast, largeText]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    localStorage.setItem("accessibility-high-contrast", String(!highContrast));
  };

  const toggleLargeText = () => {
    setLargeText(!largeText);
    localStorage.setItem("accessibility-large-text", String(!largeText));
  };

  const toggleTextToSpeech = () => {
    setTextToSpeech(!textToSpeech);
    localStorage.setItem("accessibility-text-to-speech", String(!textToSpeech));
  };

  const speakText = (text: string) => {
    if (!textToSpeech) return;
    
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        largeText,
        textToSpeech,
        toggleHighContrast,
        toggleLargeText,
        toggleTextToSpeech,
        speakText
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
}