import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, X, Send, MapPin, Heart, Info, Bot, Search, Navigation, Volume2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useAccessibility } from "@/providers/accessibility-provider";
import { toast } from "sonner";

// Generate unique session ID
function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

type Message = { 
  role: "user" | "bot"; 
  text: string; 
  timestamp?: Date;
  intent?: string;
};

type Camp = {
  id?: string;
  name: string;
  venue?: string;
  city?: string;
  date?: string;
  time?: string;
  contactPhone?: string;
  distance?: number;
};

const FAQ_CATEGORIES = [
  {
    id: "eligibility",
    name: "Eligibility",
    icon: Heart,
    color: "bg-red-100 text-red-700"
  },
  {
    id: "process",
    name: "Process",
    icon: Bot,
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "preparation",
    name: "Preparation",
    icon: Info,
    color: "bg-green-100 text-green-700"
  },
  {
    id: "recovery",
    name: "Recovery",
    icon: Heart,
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "impact",
    name: "Impact",
    icon: Heart,
    color: "bg-orange-100 text-orange-700"
  }
];

export function EnhancedChatbot() {
  const navigate = useNavigate();
  const { speakText } = useAccessibility();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      text: "👋 Hi! I'm your BloodBridge AI assistant. I can help you:\n\n🏥 Find nearby blood banks & camps\n✅ Check donation eligibility\n📝 Guide through registration\n❓ Answer FAQs\n\nHow can I assist you today?",
      timestamp: new Date()
    },
  ]);
  const [sessionId] = useState(() => generateSessionId());
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [nearbyCamps, setNearbyCamps] = useState<Camp[]>([]);
  const [showAllCamps, setShowAllCamps] = useState(false);
  const [activeView, setActiveView] = useState<'chat' | 'eligibility' | 'faqs'>('chat');
  const [faqs, setFaqs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  
  // Eligibility form
  const [eligibilityData, setEligibilityData] = useState({
    age: "",
    weight: "",
    lastDonationDays: "",
    hemoglobin: "",
    medicalConditions: [] as string[]
  });
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function pushBot(text: string, intent?: string) {
    const newMessage = { role: "bot" as const, text, timestamp: new Date(), intent };
    setMessages(prev => [...prev, newMessage]);
    speakText(text);
  }

  function pushUser(text: string) {
    setMessages(prev => [...prev, { role: "user" as const, text, timestamp: new Date() }]);
  }

  // Get user's GPS location
  const getUserLocation = async () => {
    if ("geolocation" in navigator) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(location);
          setLocationEnabled(true);
          pushBot("📍 Location enabled! Searching for blood camps...");
          
          // Fetch camps - for now just get all approved camps
          try {
            const camps = await api.getBloodCamps();
            
            if (camps && camps.length > 0) {
              // Format camps
              const formattedCamps = camps.map((camp: any) => {
                const loc = String(camp.location || "");
                const parts = loc.split(",").map((s: string) => s.trim()).filter(Boolean);
                const cityPart = parts.slice(-1)[0] || "";
                const venuePart = parts.slice(0, -1).join(", ");
                
                return {
                  id: String(camp._id || ""),
                  name: String(camp.name || "Blood Camp"),
                  venue: venuePart,
                  city: cityPart,
                  date: camp.date ? new Date(camp.date).toLocaleDateString() : undefined,
                  time: camp.time || (camp.startTime && camp.endTime ? `${camp.startTime} - ${camp.endTime}` : camp.startTime || camp.endTime || undefined),
                  contactPhone: camp.contactPhone || undefined,
                };
              });
              
              setNearbyCamps(formattedCamps.slice(0, 10));
              pushBot(`Found ${formattedCamps.length} approved blood camp(s). You can search by city for specific locations.`);
            } else {
              pushBot("No approved blood camps found at the moment. Please check back later.");
            }
          } catch (error) {
            console.error("Error fetching camps:", error);
            pushBot("Unable to fetch blood camps. Please try again or search by city name.");
          } finally {
            setIsLoading(false);
          }
        },
        (error) => {
          setIsLoading(false);
          pushBot("⚠️ Unable to access your location. You can still search for camps by city name.");
          toast.error("Location access denied");
        }
      );
    } else {
      pushBot("❌ Geolocation is not supported by your browser. Please search by city name.");
    }
  };

  // Send message to chatbot API
  async function handleSend(qIn?: string) {
    const q = (qIn ?? input).trim();
    if (!q) return;
    
    pushUser(q);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          sessionId,
          userLocation,
          metadata: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language
          }
        })
      });

      const data = await response.json();
      
      if (data.response) {
        pushBot(data.response, data.intent);
        
        // Handle specific intents
        if (data.intent === 'find_camps' && !locationEnabled) {
          setTimeout(() => {
            pushBot("Would you like to enable GPS to find camps near you? Or you can search by city name.");
          }, 1000);
        } else if (data.intent === 'eligibility') {
          setActiveView('eligibility');
        } else if (data.intent === 'faq') {
          setActiveView('faqs');
          loadFAQs();
        } else if (data.intent === 'registration') {
          setTimeout(() => {
            pushBot("Click the 'Register as Donor' button below to start the registration process.");
          }, 1000);
        }
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      pushBot("I'm having trouble connecting right now. Please try again in a moment.");
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }

  // Load FAQs
  async function loadFAQs(category?: string, search?: string) {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/faqs?${params}`);
      const data = await response.json();
      
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error("Error loading FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setIsLoading(false);
    }
  }

  // Check eligibility
  async function checkEligibility() {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: parseInt(eligibilityData.age),
          weight: eligibilityData.weight ? parseFloat(eligibilityData.weight) : undefined,
          lastDonationDays: eligibilityData.lastDonationDays ? parseInt(eligibilityData.lastDonationDays) : undefined,
          hemoglobin: eligibilityData.hemoglobin ? parseFloat(eligibilityData.hemoglobin) : undefined,
          medicalConditions: eligibilityData.medicalConditions
        })
      });

      const data = await response.json();
      setEligibilityResult(data);
      
      pushBot(data.message);
      
      if (!data.eligible && data.failedChecks) {
        const reasons = data.failedChecks.map((check: any) => `• ${check.message}`).join('\n');
        pushBot(`Reasons:\n${reasons}`);
      }
    } catch (error) {
      console.error("Eligibility check error:", error);
      toast.error("Failed to check eligibility");
    } finally {
      setIsLoading(false);
    }
  }

  // Voice recognition setup
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

  function toggleVoice() {
    if (!voiceSupported) {
      toast.error("Voice input is not supported in this browser");
      return;
    }
    if (!recognitionRef.current) return;
    if (!voiceActive) {
      try {
        recognitionRef.current.start();
        toast.success("Listening...");
      } catch {}
    } else {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  }

  // Search camps by city
  const searchCampsByCity = async () => {
    if (!citySearch.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    
    setIsLoading(true);
    try {
      const camps = await api.getBloodCamps();
      const cityLower = citySearch.toLowerCase();
      
      const filtered = camps.filter((camp: any) => {
        const loc = String(camp.location || "").toLowerCase();
        return loc.includes(cityLower);
      });
      
      if (filtered.length > 0) {
        const formattedCamps = filtered.map((camp: any) => {
          const loc = String(camp.location || "");
          const parts = loc.split(",").map((s: string) => s.trim()).filter(Boolean);
          const cityPart = parts.slice(-1)[0] || "";
          const venuePart = parts.slice(0, -1).join(", ");
          
          return {
            id: String(camp._id || ""),
            name: String(camp.name || "Blood Camp"),
            venue: venuePart,
            city: cityPart,
            date: camp.date ? new Date(camp.date).toLocaleDateString() : undefined,
            time: camp.time || (camp.startTime && camp.endTime ? `${camp.startTime} - ${camp.endTime}` : camp.startTime || camp.endTime || undefined),
            contactPhone: camp.contactPhone || undefined,
          };
        });
        
        setNearbyCamps(formattedCamps);
        pushBot(`Found ${formattedCamps.length} blood camp(s) in ${citySearch}!`);
      } else {
        setNearbyCamps([]);
        pushBot(`No blood camps found in ${citySearch}. Try a different city.`);
      }
    } catch (error) {
      console.error("Error searching camps:", error);
      pushBot("Unable to search camps. Please try again.");
      toast.error("Failed to search camps");
    } finally {
      setIsLoading(false);
    }
  };

  // Load FAQs when FAQ tab is opened
  useEffect(() => {
    if (activeView === 'faqs' && faqs.length === 0) {
      loadFAQs();
    }
  }, [activeView]);

  // Quick action buttons
  const quickActions = [
    { icon: MapPin, label: "Find Camps", action: () => getUserLocation() },
    { icon: Heart, label: "Eligibility", action: () => setActiveView('eligibility') },
    { icon: MessageCircle, label: "Register", action: () => navigate("/register-donor") },
    { icon: Info, label: "FAQs", action: () => setActiveView('faqs') }
  ];

  return (
    <div className="fixed bottom-20 right-6 z-50">
      {!open ? (
        <Button 
          className="rounded-full h-16 w-16 p-0 shadow-2xl hover:scale-110 transition-transform" 
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      ) : (
        <Card className="w-[420px] max-h-[75vh] h-[70vh] flex flex-col shadow-2xl border-2">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">AI</Badge> 
              <span className="flex items-center gap-2">
                <Bot className="h-5 w-5 animate-pulse" /> BloodBridge Assistant
              </span>
            </CardTitle>
            <div className="flex items-center gap-2">
              {locationEnabled && (
                <Badge variant="outline" className="text-xs">
                  <Navigation className="h-3 w-3 mr-1" /> GPS Active
                </Badge>
              )}
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            {/* View Tabs */}
            <div className="flex border-b bg-muted/30">
              <Button 
                variant={activeView === 'chat' ? 'default' : 'ghost'} 
                size="sm" 
                className="flex-1 rounded-none"
                onClick={() => setActiveView('chat')}
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Chat
              </Button>
              <Button 
                variant={activeView === 'eligibility' ? 'default' : 'ghost'} 
                size="sm" 
                className="flex-1 rounded-none"
                onClick={() => setActiveView('eligibility')}
              >
                <Heart className="h-4 w-4 mr-2" /> Eligibility
              </Button>
              <Button 
                variant={activeView === 'faqs' ? 'default' : 'ghost'} 
                size="sm" 
                className="flex-1 rounded-none"
                onClick={() => { setActiveView('faqs'); loadFAQs(); }}
              >
                <Info className="h-4 w-4 mr-2" /> FAQs
              </Button>
            </div>

            {/* Chat View */}
            {activeView === 'chat' && (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[85%] p-3 rounded-lg ${
                          m.role === "bot" 
                            ? "bg-gradient-to-br from-muted to-muted/50 border" 
                            : "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                        {m.timestamp && (
                          <div className="text-xs opacity-60 mt-1">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted p-3 rounded-lg border">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="p-3 border-t bg-muted/20">
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {quickActions.map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <Button 
                          key={idx}
                          variant="outline" 
                          size="sm" 
                          className="flex flex-col h-auto py-2 gap-1"
                          onClick={action.action}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{action.label}</span>
                        </Button>
                      );
                    })}
                  </div>

                  {/* City Search */}
                  <div className="mb-3 space-y-2">
                    <div className="text-sm font-medium">Search Camps by City:</div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Enter city name (e.g., Delhi)" 
                        value={citySearch} 
                        onChange={(e) => setCitySearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isLoading && searchCampsByCity()}
                        disabled={isLoading}
                        className="flex-1"
                      />
                      <Button 
                        onClick={searchCampsByCity} 
                        disabled={isLoading || !citySearch.trim()}
                        size="sm"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Nearby Camps Display */}
                  {nearbyCamps.length > 0 && (
                    <div className="mb-3 space-y-2">
                      <div className="text-sm font-medium">Blood Camps Found:</div>
                      {(showAllCamps ? nearbyCamps : nearbyCamps.slice(0, 3)).map((camp, idx) => (
                        <div key={idx} className="text-xs p-2 border rounded bg-background">
                          <div className="font-medium">{camp.name}</div>
                          {camp.distance && <div className="text-muted-foreground">📍 {camp.distance.toFixed(1)} km away</div>}
                          {camp.venue && <div className="text-muted-foreground">📍 {camp.venue}</div>}
                          {camp.date && <div className="text-muted-foreground">📅 {camp.date}</div>}
                          {camp.contactPhone && (
                            <a href={`tel:${camp.contactPhone}`} className="text-primary">
                              📞 {camp.contactPhone}
                            </a>
                          )}
                        </div>
                      ))}
                      {nearbyCamps.length > 3 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full"
                          onClick={() => setShowAllCamps(!showAllCamps)}
                        >
                          {showAllCamps ? 'Show Less' : `Show All (${nearbyCamps.length})`}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type your message..." 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    {voiceSupported && (
                      <Button 
                        variant={voiceActive ? "destructive" : "outline"} 
                        size="icon" 
                        onClick={toggleVoice}
                        disabled={isLoading}
                      >
                        <Mic className={`h-4 w-4 ${voiceActive ? 'animate-pulse' : ''}`} />
                      </Button>
                    )}
                    <Button onClick={() => handleSend()} disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility View */}
            {activeView === 'eligibility' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <Heart className="h-12 w-12 mx-auto text-primary mb-2" />
                    <h3 className="font-semibold text-lg">Blood Donation Eligibility</h3>
                    <p className="text-sm text-muted-foreground">
                      Check if you meet the basic requirements to donate blood
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span>Age *</span>
                        <span className="text-xs text-muted-foreground">(18-65 years)</span>
                      </label>
                      <Input 
                        type="number" 
                        placeholder="Enter your age" 
                        value={eligibilityData.age}
                        onChange={(e) => setEligibilityData({...eligibilityData, age: e.target.value})}
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span>Weight (kg)</span>
                        <span className="text-xs text-muted-foreground">(Min 50 kg)</span>
                      </label>
                      <Input 
                        type="number" 
                        placeholder="Enter your weight in kg" 
                        value={eligibilityData.weight}
                        onChange={(e) => setEligibilityData({...eligibilityData, weight: e.target.value})}
                        min="1"
                        step="0.1"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span>Days Since Last Donation</span>
                        <span className="text-xs text-muted-foreground">(Min 56 days)</span>
                      </label>
                      <Input 
                        type="number" 
                        placeholder="Leave empty if first time donor" 
                        value={eligibilityData.lastDonationDays}
                        onChange={(e) => setEligibilityData({...eligibilityData, lastDonationDays: e.target.value})}
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <span>Hemoglobin Level (g/dL)</span>
                        <span className="text-xs text-muted-foreground">(Min 12.5)</span>
                      </label>
                      <Input 
                        type="number" 
                        step="0.1"
                        placeholder="Optional - if known" 
                        value={eligibilityData.hemoglobin}
                        onChange={(e) => setEligibilityData({...eligibilityData, hemoglobin: e.target.value})}
                        min="0"
                        max="25"
                      />
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={checkEligibility}
                      disabled={!eligibilityData.age || isLoading}
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Heart className="h-4 w-4 mr-2" />}
                      Check My Eligibility
                    </Button>
                  </div>

                  {eligibilityResult && (
                    <div className={`p-4 rounded-lg border-2 ${
                      eligibilityResult.eligible 
                        ? 'bg-green-50 border-green-500 dark:bg-green-950' 
                        : 'bg-red-50 border-red-500 dark:bg-red-950'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {eligibilityResult.eligible ? (
                          <>
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                              <Heart className="h-5 w-5 text-white fill-white" />
                            </div>
                            <div className="font-semibold">You are eligible to donate!</div>
                          </>
                        ) : (
                          <>
                            <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
                              <X className="h-5 w-5 text-white" />
                            </div>
                            <div className="font-semibold">Not eligible at this time</div>
                          </>
                        )}
                      </div>
                      <div className="text-sm mb-3">{eligibilityResult.message}</div>
                      
                      {eligibilityResult.failedChecks && eligibilityResult.failedChecks.length > 0 && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          <div className="font-medium text-sm">Requirements not met:</div>
                          {eligibilityResult.failedChecks.map((check: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2 text-xs">
                              <X className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <span>{check.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {eligibilityResult.eligible && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs text-muted-foreground">
                            ⚠️ This is a preliminary check. Final eligibility will be determined by medical screening at the donation center.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg space-y-2">
                    <div className="font-semibold text-sm flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      <span>Basic Eligibility Requirements</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Age:</strong> Between 18-65 years</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Weight:</strong> Minimum 50 kg (110 lbs)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Hemoglobin:</strong> ≥12.5 g/dL for men, ≥12.0 g/dL for women</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Frequency:</strong> Wait at least 56 days (8 weeks) between donations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Health:</strong> Generally good health, no chronic illnesses</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <span><strong>Lifestyle:</strong> No recent tattoos/piercings (3-12 months), no recent travel to malaria zones</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-3 rounded-lg text-xs">
                    <div className="font-medium mb-2">💡 Did you know?</div>
                    <p className="text-muted-foreground">
                      Your body replaces the donated plasma within 24 hours and red blood cells within 4-6 weeks. Donating blood is safe and can even have health benefits!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* FAQs View */}
            {activeView === 'faqs' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="space-y-3">
                  <div className="text-center">
                    <Info className="h-12 w-12 mx-auto text-primary mb-2" />
                    <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      Find answers to common questions about blood donation
                    </p>
                  </div>
                  
                  <div className=e) => {
                        setFaqSearch(e.target.value);
                        loadFAQs(selectedCategory || undefined, e.target.value);
                      }}
                    />
                  </div>

                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <Button
                      variant={!selectedCategory ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedCategory(null);
                        loadFAQs(undefined, faqSearch);
                      }}
                    >
                      All
                    </Button>
                    {FAQ_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            loadFAQs(category.id, faqSearch);
                          }}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {category.name}
                        </Button>
                      );
                    })}
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : faqs.length > 0 ? (
                    <div className="space-y-3">
                      {faqs.map((faq, index) => (
                        <div key={index} className="border rounded-lg p-3 bg-background hover:shadow-md transition-shadow">
                          <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                          <p className="text-xs text-muted-foreground">{faq.answer}</p>
                          {faq.tags && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {faq.tags.map((tag: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No FAQs found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
