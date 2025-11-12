import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, MapPin, Heart, Info, Search, Loader2, Lightbulb, AlertCircle, Hospital, Mic, Volume2, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { toast } from "sonner";

type Message = { role: "user" | "bot"; text: string; timestamp: Date };

export function SimpleChatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "eligibility" | "faqs" | "tips" | "myths" | "hospitals">("chat");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "bot", 
      text: "👋 Hi! I'm your BloodBridge assistant. I can help you find blood camps, check eligibility, and answer questions!",
      timestamp: new Date()
    }
  ]);
  const [citySearch, setCitySearch] = useState("");
  const [camps, setCamps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Eligibility
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [lastDonation, setLastDonation] = useState("");
  const [hemoglobin, setHemoglobin] = useState("");
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  
  // FAQs
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [faqSearch, setFaqSearch] = useState("");
  
  // Voice
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Donation reminder
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [nextDonationDate, setNextDonationDate] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition failed");
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser");
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("Listening...");
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const calculateNextDonation = (lastDate: string) => {
    if (!lastDate) return;
    const last = new Date(lastDate);
    const next = new Date(last);
    next.setDate(next.getDate() + 56); // 56 days = 8 weeks
    setNextDonationDate(next.toLocaleDateString());
    
    const today = new Date();
    const daysUntil = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > 0) {
      addMessage("bot", `You can donate again in ${daysUntil} days (${next.toLocaleDateString()}). We'll remind you!`);
    } else {
      addMessage("bot", `You're eligible to donate now! Find a camp near you.`);
    }
  };

  const addMessage = (role: "user" | "bot", text: string) => {
    setMessages(prev => [...prev, { role, text, timestamp: new Date() }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage("user", input);
    
    // Simple responses
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("camp") || lowerInput.includes("find")) {
      addMessage("bot", "Use the search box below to find camps by city name!");
    } else if (lowerInput.includes("eligible")) {
      addMessage("bot", "Click the 'Eligibility' tab to check if you can donate!");
      setActiveTab("eligibility");
    } else if (lowerInput.includes("faq") || lowerInput.includes("question")) {
      addMessage("bot", "Check the 'FAQs' tab for answers to common questions!");
      setActiveTab("faqs");
    } else {
      addMessage("bot", "I can help you find camps, check eligibility, or answer FAQs. What would you like to know?");
    }
    
    setInput("");
  };

  const searchCamps = async () => {
    if (!citySearch.trim()) {
      toast.error("Please enter a city name");
      return;
    }
    
    setIsLoading(true);
    try {
      const allCamps = await api.getBloodCamps();
      const filtered = allCamps.filter((camp: any) => 
        camp.location?.toLowerCase().includes(citySearch.toLowerCase())
      );
      setCamps(filtered);
      addMessage("bot", `Found ${filtered.length} camp(s) in ${citySearch}!`);
    } catch (error) {
      toast.error("Failed to search camps");
    } finally {
      setIsLoading(false);
    }
  };

  const checkEligibility = () => {
    if (!age) {
      toast.error("Please enter your age");
      return;
    }

    const ageNum = parseInt(age);
    const weightNum = weight ? parseFloat(weight) : 50;
    const lastDonationNum = lastDonation ? parseInt(lastDonation) : 100;
    const hemoglobinNum = hemoglobin ? parseFloat(hemoglobin) : 13;

    const eligible = 
      ageNum >= 18 && ageNum <= 65 &&
      weightNum >= 50 &&
      lastDonationNum >= 56 &&
      hemoglobinNum >= 12.5;

    setEligibilityResult({
      eligible,
      message: eligible 
        ? "✅ You appear eligible to donate blood!" 
        : "❌ You may not be eligible at this time.",
      checks: {
        age: ageNum >= 18 && ageNum <= 65,
        weight: weightNum >= 50,
        lastDonation: lastDonationNum >= 56,
        hemoglobin: hemoglobinNum >= 12.5
      }
    });
  };

  // Health Tips Data
  const healthTips = {
    preDonation: [
      { icon: "🥗", tip: "Eat iron-rich foods", detail: "Spinach, red meat, beans, lentils, fortified cereals" },
      { icon: "💧", tip: "Drink plenty of water", detail: "16 oz extra water before donation" },
      { icon: "😴", tip: "Get good sleep", detail: "At least 7-8 hours the night before" },
      { icon: "🍽️", tip: "Eat a healthy meal", detail: "3 hours before donation, avoid fatty foods" },
      { icon: "🚫", tip: "Avoid alcohol", detail: "24 hours before donation" }
    ],
    postDonation: [
      { icon: "💧", tip: "Hydrate well", detail: "Drink extra fluids for 24-48 hours" },
      { icon: "🍊", tip: "Eat vitamin C foods", detail: "Helps iron absorption - oranges, tomatoes" },
      { icon: "😌", tip: "Rest if needed", detail: "Avoid strenuous activity for 24 hours" },
      { icon: "🩹", tip: "Keep bandage on", detail: "For at least 4 hours" },
      { icon: "🍫", tip: "Have a snack", detail: "Juice and cookies help restore energy" }
    ],
    ironRichFoods: [
      "🥩 Red meat (beef, lamb)",
      "🐔 Poultry (chicken, turkey)",
      "🐟 Fish (tuna, salmon)",
      "🥬 Dark leafy greens (spinach, kale)",
      "🫘 Beans and lentils",
      "🥜 Nuts and seeds",
      "🥚 Eggs",
      "🌾 Fortified cereals"
    ]
  };

  // Myths Data
  const myths = [
    {
      myth: "Blood donation is painful",
      fact: "You may feel a slight pinch, but most donors report minimal discomfort. The needle is in for only 8-10 minutes.",
      icon: "💉"
    },
    {
      myth: "Donating makes you weak",
      fact: "Your body replaces the fluid within 24 hours. You may feel slightly tired but can resume normal activities immediately.",
      icon: "💪"
    },
    {
      myth: "You can get diseases from donating",
      fact: "Impossible! All equipment is sterile and used only once. You cannot contract any disease by donating blood.",
      icon: "🛡️"
    },
    {
      myth: "Older people can't donate",
      fact: "Healthy individuals up to 65+ can donate with doctor approval. Age is just a number if you're healthy!",
      icon: "👴"
    },
    {
      myth: "Vegetarians can't donate",
      fact: "Vegetarians can donate if they meet hemoglobin requirements. Eat iron-rich plant foods!",
      icon: "🥗"
    },
    {
      myth: "You need to know your blood type",
      fact: "Not necessary! Your blood type will be tested when you donate. It's a free benefit!",
      icon: "🩸"
    }
  ];

  // Real Hospitals from database
  const [hospitals, setHospitals] = useState<any[]>([]);

  const faqs = [
    {
      category: "eligibility",
      question: "Who can donate blood?",
      answer: "Healthy individuals aged 18-65 years weighing at least 50kg can donate blood."
    },
    {
      category: "eligibility",
      question: "How often can I donate?",
      answer: "You can donate whole blood every 3 months (4 times a year)."
    },
    {
      category: "process",
      question: "Is blood donation safe?",
      answer: "Yes! All equipment is sterile and used only once. The process is supervised by trained professionals."
    },
    {
      category: "process",
      question: "How long does it take?",
      answer: "The actual donation takes 10-15 minutes. The entire process takes about 30-45 minutes."
    },
    {
      category: "preparation",
      question: "What should I do before donating?",
      answer: "Eat a healthy meal, drink plenty of fluids, and get good sleep before donation."
    },
    {
      category: "recovery",
      question: "How long to recover?",
      answer: "Your body replaces plasma within 24 hours. Red blood cells take 4-6 weeks."
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    const matchesSearch = !faqSearch || 
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!open) {
    return (
      <div className="fixed bottom-20 right-6 z-50">
        <Button 
          className="rounded-full h-16 w-16 p-0 shadow-2xl hover:scale-110 transition-transform" 
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-50">
      <Card className="w-[400px] h-[600px] flex flex-col shadow-2xl border-2">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white">AI</Badge>
            <span>BloodBridge Assistant</span>
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Tabs */}
        <div className="flex border-b overflow-x-auto">
          <Button variant={activeTab === "chat" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("chat")}>
            <MessageCircle className="h-3 w-3 mr-1" /> Chat
          </Button>
          <Button variant={activeTab === "tips" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("tips")}>
            <Lightbulb className="h-3 w-3 mr-1" /> Tips
          </Button>
          <Button variant={activeTab === "myths" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("myths")}>
            <AlertCircle className="h-3 w-3 mr-1" /> Myths
          </Button>
          <Button variant={activeTab === "hospitals" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("hospitals")}>
            <Hospital className="h-3 w-3 mr-1" /> Hospitals
          </Button>
          <Button variant={activeTab === "eligibility" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("eligibility")}>
            <Heart className="h-3 w-3 mr-1" /> Check
          </Button>
          <Button variant={activeTab === "faqs" ? "default" : "ghost"} size="sm" className="rounded-none whitespace-nowrap" onClick={() => setActiveTab("faqs")}>
            <Info className="h-3 w-3 mr-1" /> FAQs
          </Button>
        </div>

        <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg ${
                      m.role === "bot" ? "bg-muted border" : "bg-primary text-primary-foreground"
                    }`}>
                      <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t space-y-3">
                {/* City Search */}
                <div>
                  <div className="text-sm font-medium mb-2">Search Camps by City:</div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter city (e.g., Delhi)" 
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchCamps()}
                    />
                    <Button onClick={searchCamps} disabled={isLoading}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Camps Results */}
                {camps.length > 0 && (
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {camps.slice(0, 3).map((camp, idx) => (
                      <div key={idx} className="text-xs p-2 border rounded bg-background">
                        <div className="font-medium">{camp.name}</div>
                        <div className="text-muted-foreground">{camp.location}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type or speak..." 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button 
                    variant={isListening ? "destructive" : "outline"} 
                    size="icon"
                    onClick={toggleVoiceInput}
                  >
                    <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Health Tips Tab */}
          {activeTab === "tips" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Health Tips & Reminders</h3>
              </div>

              {/* Donation Reminder */}
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 font-semibold">
                  <Calendar className="h-4 w-4" />
                  <span>Next Donation Calculator</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Donation Date</label>
                  <Input 
                    type="date" 
                    value={lastDonationDate}
                    onChange={(e) => {
                      setLastDonationDate(e.target.value);
                      calculateNextDonation(e.target.value);
                    }}
                  />
                </div>
                {nextDonationDate && (
                  <div className="text-sm bg-background p-3 rounded">
                    <strong>Next eligible date:</strong> {nextDonationDate}
                  </div>
                )}
              </div>

              {/* Pre-Donation Tips */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">🍽️</span>
                  Before Donation
                </h4>
                <div className="space-y-2">
                  {healthTips.preDonation.map((tip, idx) => (
                    <div key={idx} className="bg-background border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{tip.tip}</div>
                          <div className="text-xs text-muted-foreground">{tip.detail}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Post-Donation Care */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <span className="text-2xl">💊</span>
                  After Donation
                </h4>
                <div className="space-y-2">
                  {healthTips.postDonation.map((tip, idx) => (
                    <div key={idx} className="bg-background border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <div className="font-medium text-sm">{tip.tip}</div>
                          <div className="text-xs text-muted-foreground">{tip.detail}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Iron-Rich Foods */}
              <div>
                <h4 className="font-semibold mb-3">🥗 Iron-Rich Foods</h4>
                <div className="bg-background border rounded-lg p-3 space-y-1">
                  {healthTips.ironRichFoods.map((food, idx) => (
                    <div key={idx} className="text-sm">{food}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Myths Tab */}
          {activeTab === "myths" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Myth Busters</h3>
                <p className="text-sm text-muted-foreground">Facts vs Fiction</p>
              </div>

              <div className="space-y-3">
                {myths.map((item, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-red-50 dark:bg-red-950 p-3 border-b">
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{item.icon}</span>
                        <div>
                          <div className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">❌ MYTH</div>
                          <div className="font-medium text-sm">{item.myth}</div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950 p-3">
                      <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">✅ FACT</div>
                      <div className="text-sm">{item.fact}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-lg text-center">
                <p className="text-sm font-medium">💡 Share these facts to spread awareness!</p>
              </div>
            </div>
          )}

          {/* Hospitals Tab */}
          {activeTab === "hospitals" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <Hospital className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Nearby Blood Banks</h3>
                <p className="text-sm text-muted-foreground">Hospitals & Blood Centers</p>
              </div>

              <div className="space-y-3">
                {nearbyHospitals.map((hospital, idx) => (
                  <div key={idx} className="border rounded-lg p-4 bg-background hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Hospital className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-2">{hospital.name}</h4>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{hospital.distance} away</span>
                          </div>
                          <div>{hospital.address}</div>
                          <a href={`tel:${hospital.phone}`} className="text-primary hover:underline block">
                            📞 {hospital.phone}
                          </a>
                        </div>
                        <Button size="sm" className="w-full mt-3" variant="outline">
                          <MapPin className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-muted/50 p-3 rounded-lg text-xs text-center">
                <p>💡 Call ahead to confirm blood bank hours and availability</p>
              </div>
            </div>
          )}

          {/* Eligibility Tab */}
          {activeTab === "eligibility" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <Heart className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Check Your Eligibility</h3>
                <p className="text-sm text-muted-foreground">Answer these questions</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Age * (18-65)</label>
                  <Input type="number" placeholder="Enter age" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Weight (kg) (Min 50)</label>
                  <Input type="number" placeholder="Enter weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Days Since Last Donation (Min 56)</label>
                  <Input type="number" placeholder="Leave empty if first time" value={lastDonation} onChange={(e) => setLastDonation(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium">Hemoglobin (g/dL) (Min 12.5)</label>
                  <Input type="number" step="0.1" placeholder="Optional" value={hemoglobin} onChange={(e) => setHemoglobin(e.target.value)} />
                </div>

                <Button className="w-full" onClick={checkEligibility} disabled={!age}>
                  <Heart className="h-4 w-4 mr-2" /> Check Eligibility
                </Button>
              </div>

              {eligibilityResult && (
                <div className={`p-4 rounded-lg border-2 ${
                  eligibilityResult.eligible ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="font-semibold mb-2">{eligibilityResult.message}</div>
                  <div className="text-sm space-y-1">
                    <div>Age: {eligibilityResult.checks.age ? '✅' : '❌'}</div>
                    <div>Weight: {eligibilityResult.checks.weight ? '✅' : '❌'}</div>
                    <div>Last Donation: {eligibilityResult.checks.lastDonation ? '✅' : '❌'}</div>
                    <div>Hemoglobin: {eligibilityResult.checks.hemoglobin ? '✅' : '❌'}</div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1">
                <div className="font-medium">Requirements:</div>
                <div>• Age: 18-65 years</div>
                <div>• Weight: ≥50 kg</div>
                <div>• Hemoglobin: ≥12.5 g/dL</div>
                <div>• Wait 56 days between donations</div>
              </div>
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="text-center">
                <Info className="h-12 w-12 mx-auto text-primary mb-2" />
                <h3 className="font-semibold">Frequently Asked Questions</h3>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search FAQs..." 
                  className="pl-10"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All
                </Button>
                {['eligibility', 'process', 'preparation', 'recovery'].map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                {filteredFAQs.map((faq, idx) => (
                  <div key={idx} className="border rounded-lg p-3 bg-background">
                    <h4 className="font-medium text-sm mb-2">{faq.question}</h4>
                    <p className="text-xs text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
                {filteredFAQs.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm">No FAQs found</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
