import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAccessibility } from "@/providers/accessibility-provider";
import { Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function AccessibilitySettings() {
  const { highContrast, largeText, textToSpeech, toggleHighContrast, toggleLargeText, toggleTextToSpeech } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedHighContrast = localStorage.getItem("accessibility-high-contrast") === "true";
    const savedLargeText = localStorage.getItem("accessibility-large-text") === "true";
    const savedTextToSpeech = localStorage.getItem("accessibility-text-to-speech") === "true";
    
    if (savedHighContrast && !highContrast) toggleHighContrast();
    if (savedLargeText && !largeText) toggleLargeText();
    if (savedTextToSpeech && !textToSpeech) toggleTextToSpeech();
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button 
          className="p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Accessibility settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Accessibility Settings</SheetTitle>
          <SheetDescription>
            Customize your experience with accessibility options
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast" className="text-base">
                High Contrast
              </Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={highContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="large-text" className="text-base">
                Large Text
              </Label>
              <p className="text-sm text-muted-foreground">
                Increases font size for better readability
              </p>
            </div>
            <Switch
              id="large-text"
              checked={largeText}
              onCheckedChange={toggleLargeText}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="text-to-speech" className="text-base">
                Text-to-Speech
              </Label>
              <p className="text-sm text-muted-foreground">
                Reads text aloud as you navigate
              </p>
            </div>
            <Switch
              id="text-to-speech"
              checked={textToSpeech}
              onCheckedChange={toggleTextToSpeech}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}