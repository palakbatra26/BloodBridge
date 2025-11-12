import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, X, Send, MapPin, Heart, Info, Bot, Search, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAccessibility } from "@/providers/accessibility-provider";
import { toast } from "sonner";

type Message = { role: "user" | "bot"; text: string };

// Enhanced FAQ data with categories
const FAQ_CATEGORIES = [
  {
    id: "eligibility",
    name: "Eligibility",
    icon: Heart,
    faqs: [
      {
        question: "Who can donate blood?",
        answer: "Healthy individuals aged 18-65 years weighing at least 50kg can donate blood. You should be free from any chronic illness and not have donated blood in the last 3 months."
      },
      {
        question: "How often can I donate?",
        answer: "You can donate whole blood every 3 months (4 times a year). For platelet donations, you can donate every 2 weeks."
      },
      {
        question: "What should I do before donating?",
        answer: "Eat a healthy meal and drink plenty of fluids before donation. Get a good night's sleep and avoid alcohol for 24 hours before donation."
      }
    ]
  },
  {
    id: "process",
    name: "Donation Process",
    icon: Bot,
    faqs: [
      {
        question: "Is blood donation safe?",
        answer: "Yes, blood donation is safe. All equipment is sterile and used only once. The process takes about 10-15 minutes and is supervised by trained medical professionals."
      },
      {
        question: "How long does it take to recover?",
        answer: "Your body replaces the blood volume (plasma) within 24 hours. Red blood cells take about 4-6 weeks to completely replenish."
      },
      {
        question: "What happens during donation?",
        answer: "The process includes registration, health screening, donation (10-15 minutes), and refreshments. The entire process takes about 30-45 minutes."
      }
    ]
  },
  {
    id: "impact",
    name: "Impact",
    icon: Heart,
    faqs: [
      {
        question: "How can I find blood camps?",
        answer: "Check our Blood Camps page for upcoming events near you. You can also register to be notified when camps are organized in your area."
      },
      {
        question: "How many lives can one donation save?",
        answer: "A single blood donation can save up to 3 lives. Different blood components can be used to help multiple patients."
      },
      {
        question: "Why is blood donation important?",
        answer: "Blood donation is crucial for saving lives during emergencies, surgeries, and treating patients with blood disorders. There's no substitute for human blood."
      }
    ]
  }
];

function isEligible(age: number, lastDonationDays?: number, hemoglobin?: number) {
  if (age < 18 || age > 65) return false;
  if (typeof hemoglobin === "number" && hemoglobin < 12.5) return false;
  if (typeof lastDonationDays === "number" && lastDonationDays < 56) return false;
  return true;
}

export function Chatbot() {
  const navigate = useNavigate();
  const { speakText } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I'm your BloodBridge assistant. I can help you find blood banks, check donation eligibility, guide donor registration, and answer blood donation FAQs. How can I assist you today?" },
  ]);
  const [findingCity, setFindingCity] = useState("");
  const [findResults, setFindResults] = useState<{ id?: string; name: string; venue?: string; city?: string; date?: string; time?: string; contactPhone?: string }[]>([]);
  const [eligibilityAge, setEligibilityAge] = useState<string>("");
  const [eligibilityDaysSince, setEligibilityDaysSince] = useState<string>("");
  const [eligibilityHb, setEligibilityHb] = useState<string>("");
  const [showAllResults, setShowAllResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);

  function pushBot(text: string) {
    setMessages(prev => [...prev, { role: "bot", text }]);
    speakText(text);
  }

  function pushUser(text: string) {
    setMessages(prev => [...prev, { role: "user", text }]);
  }

  // Get user's GPS location
  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationEnabled(true);
          pushBot("Location enabled! I can now help you find nearby blood camps.");
        },
        (error) => {
          pushBot("Unable to access your location. Please enable location services or search by city name.");
        }
      );
    } else {
      pushBot("Geolocation is not supported by your browser. Please search by city name.");
    }
  };

  const recognitionRef = useRef<any | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  // Enhanced AI response function
  async function getAIResponse(userInput: string) {
    setIsLoading(true);
    
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const lowerInput = userInput.toLowerCase();
      
      // Handle specific intents
      if (lowerInput.includes("nearest") || lowerInput.includes("near") || lowerInput.includes("blood bank") || lowerInput.includes("hospital")) {
        return "I can help you find nearby blood banks. Please enter your city in the search box below.";
      }
      
      if (lowerInput.includes("eligibility") || lowerInput.includes("eligible") || lowerInput.includes("donate")) {
        return "I can help you check your donation eligibility. Please fill in your age, days since last donation, and hemoglobin level in the form below.";
      }
      
      if (lowerInput.includes("register") || lowerInput.includes("donor")) {
        return "You can register as a donor by clicking the 'Register as Donor' button or by navigating to the donor registration page.";
      }
      
      if (lowerInput.includes("faq") || lowerInput.includes("question") || lowerInput.includes("info")) {
        return "I can help you with FAQs. Please select a category below or search for specific questions.";
      }
      
      if (lowerInput.includes("thank")) {
        return "You're welcome! Is there anything else I can help you with?";
      }
      
      if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
        return "Hello! How can I assist you with blood donation today?";
      }
      
      // Default responses for general queries
      const responses = [
        "I understand you're asking about blood donation. How can I specifically help you?",
        "That's a great question about blood donation. Would you like me to help you find blood banks, check eligibility, or register as a donor?",
        "I'm here to help with blood donation information. You can ask me about finding blood banks, checking eligibility, or registering as a donor.",
        "For more specific information, you can ask me about blood banks near you, donation eligibility, or how to register as a donor."
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error("AI response error:", error);
      return "I'm having trouble processing your request right now. Please try again or ask a different question.";
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSend(qIn?: string) {
    const q = (qIn ?? input).trim();
    if (!q) return;
    pushUser(q);
    setInput("");

    // Get AI response
    const response = await getAIResponse(q);
    pushBot(response);
  }

  function toggleVoice() {
    if (!voiceSupported) {
      pushBot("Voice input is not supported in this browser.");
      return;
    }
    if (!recognitionRef.current) return;
    if (!voiceActive) {
      try {
        recognitionRef.current.start();
      } catch {}
    } else {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setVoiceSupported(false);
      return;
    }
    setVoiceSupported(true);
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onstart = () => setVoiceActive(true);
    r.onend = () => setVoiceActive(false);
    r.onerror = () => setVoiceActive(false);
    r.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) {
        handleSend(transcript);
      }
    };
    recognitionRef.current = r;
    return () => {
      try {
        r.stop();
      } catch {}
      recognitionRef.current = null;
    };
  }, []);

  async function handleFindNearby() {
    const city = findingCity.trim();
    if (!city) return;
    try {
      setIsLoading(true);
      const camps = await api.getBloodCamps();
      const norm = (s: string) => s.toLowerCase();
      const filtered = (Array.isArray(camps) ? camps : []).filter((c: any) => {
        const loc = String(c.location || "");
        return norm(loc).includes(norm(city));
      }).map((c: any) => {
        const loc = String(c.location || "");
        const parts = loc.split(",").map((s: string) => s.trim()).filter(Boolean);
        const cityPart = parts.slice(-1)[0] || "";
        const venuePart = parts.slice(0, -1).join(", ");
        return {
          id: String(c._id || ""),
          name: String(c.name || "Blood Camp"),
          venue: venuePart,
          city: cityPart,
          date: c.date ? new Date(c.date).toLocaleDateString() : undefined,
          time: c.time || (c.startTime && c.endTime ? `${c.startTime} - ${c.endTime}` : c.startTime || c.endTime || undefined),
          contactPhone: c.contactPhone || undefined,
        };
      });
      const seen = new Set<string>();
      const unique = filtered.filter(r => {
        const key = `${r.id}-${r.name}-${r.date}-${r.city}-${r.venue}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setFindResults(unique);
      setShowAllResults(false);
      if (unique.length > 0) {
        pushBot(`Found ${unique.length} approved camp(s) in ${city}.`);
      } else {
        pushBot(`No approved camps found in ${city} right now.`);
      }
    } catch (err) {
      pushBot("Could not load camps. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleEligibilityCheck() {
    const ageNum = parseInt(eligibilityAge || "0", 10);
    const daysNum = eligibilityDaysSince ? parseInt(eligibilityDaysSince, 10) : undefined;
    const hbNum = eligibilityHb ? parseFloat(eligibilityHb) : undefined;
    const ok = isEligible(ageNum, daysNum, hbNum);
    if (ok) {
      pushBot("You appear eligible to donate. Please confirm with medical screening at the camp.");
    } else {
      pushBot("You may not be eligible now. Typical requirements: age 18–65, hemoglobin ≥12.5 g/dL, and at least 56 days since last donation.");
    }
  }

  // Filter FAQs based on search query
  const filteredFAQs = activeCategory 
    ? FAQ_CATEGORIES.find(cat => cat.id === activeCategory)?.faqs || []
    : FAQ_CATEGORIES.flatMap(cat => cat.faqs).filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <Button className="rounded-full h-14 w-14 p-0 shadow-lg" onClick={() => setOpen(true)}>
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[380px] max-h-[80vh] h-[75vh] flex flex-col shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-primary">AI</Badge> 
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" /> BloodBridge Assistant
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 overflow-y-auto">
            <div className="space-y-2">
              <div className="font-medium">Chat</div>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={m.role === "bot" ? "bg-muted/50 p-3 rounded-lg" : "p-3 rounded-lg bg-primary/10"}
                  >
                    {m.text}
                  </div>
                ))}
                {isLoading && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Ask me anything about blood donation..." 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button variant={voiceActive ? "destructive" : "outline"} size="icon" onClick={toggleVoice}>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button onClick={() => handleSend()} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex items-center gap-2" onClick={() => pushBot("Enter your city to find nearby approved camps.")}> 
                  <MapPin className="h-4 w-4" /> Find Camps
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => pushBot("Enter your age, days since last donation, and hemoglobin (optional). Use the checker below.")}> 
                  <Heart className="h-4 w-4" /> Eligibility
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => { pushBot("Opening donor registration."); navigate("/register-donor"); }}> 
                  <MessageCircle className="h-4 w-4" /> Registration
                </Button>
                <Button variant="outline" className="flex items-center gap-2" onClick={() => setActiveCategory("faq")}> 
                  <Info className="h-4 w-4" /> FAQs
                </Button>
              </div>
            </div>

            {/* FAQ Section */}
            {activeCategory === "faq" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Frequently Asked Questions</h3>
                  <Button variant="ghost" size="sm" onClick={() => setActiveCategory(null)}>Back</Button>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search FAQs..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {!searchQuery && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {FAQ_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 whitespace-nowrap"
                          onClick={() => setActiveCategory(category.id)}
                        >
                          <Icon className="h-4 w-4" />
                          {category.name}
                        </Button>
                      );
                    })}
                  </div>
                )}
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <h4 className="font-medium">{faq.question}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground text-sm">No FAQs found matching your search.</p>
                  )}
                </div>
              </div>
            )}

            {activeCategory !== "faq" && (
              <>
                <div className="space-y-2">
                  <div className="font-medium">Find Approved Camps by City</div>
                  <div className="flex gap-2">
                    <Input placeholder="Enter city" value={findingCity} onChange={(e) => setFindingCity(e.target.value)} />
                    <Button onClick={handleFindNearby} disabled={isLoading}>Search</Button>
                  </div>
                  {findResults.length > 0 && (
                    <div className="space-y-2">
                      {(showAllResults ? findResults : findResults.slice(0, 5)).map((r, idx) => (
                        <div key={idx} className="text-sm p-2 border rounded">
                          <div className="font-medium">{r.name}</div>
                          {r.venue && <div className="text-muted-foreground">Venue: {r.venue}</div>}
                          {r.city && <div className="text-muted-foreground">City: {r.city}</div>}
                          {r.date && <div className="text-muted-foreground">{r.date}{r.time ? ` • ${r.time}` : ''}</div>}
                          {r.contactPhone && <a href={`tel:${r.contactPhone}`} className="text-primary">{r.contactPhone}</a>}
                        </div>
                      ))}
                      {findResults.length > 5 && (
                        <Button variant="ghost" size="sm" onClick={() => setShowAllResults(v => !v)}>{showAllResults ? "Show less" : "Show all"}</Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="font-medium">Donation Eligibility Checker</div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="Age" value={eligibilityAge} onChange={(e) => setEligibilityAge(e.target.value)} />
                    <Input placeholder="Days since donation" value={eligibilityDaysSince} onChange={(e) => setEligibilityDaysSince(e.target.value)} />
                    <Input placeholder="Hemoglobin g/dL" value={eligibilityHb} onChange={(e) => setEligibilityHb(e.target.value)} />
                  </div>
                  <Button onClick={handleEligibilityCheck} disabled={isLoading}>Check</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}