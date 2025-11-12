import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mic, X, Send, MapPin, Heart, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";

type Message = { role: "user" | "bot"; text: string };

function isEligible(age: number, lastDonationDays?: number, hemoglobin?: number) {
  if (age < 18 || age > 65) return false;
  if (typeof hemoglobin === "number" && hemoglobin < 12.5) return false;
  if (typeof lastDonationDays === "number" && lastDonationDays < 56) return false;
  return true;
}

export function Chatbot() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hi! I can help you find blood banks, check donation eligibility, guide donor registration, and answer blood donation FAQs." },
  ]);
  const [findingCity, setFindingCity] = useState("");
  const [findResults, setFindResults] = useState<{ id?: string; name: string; venue?: string; city?: string; date?: string; time?: string; contactPhone?: string }[]>([]);
  const [eligibilityAge, setEligibilityAge] = useState<string>("");
  const [eligibilityDaysSince, setEligibilityDaysSince] = useState<string>("");
  const [eligibilityHb, setEligibilityHb] = useState<string>("");
  const [showAllResults, setShowAllResults] = useState(false);

  function pushBot(text: string) {
    setMessages(prev => [...prev, { role: "bot", text }]);
  }

  function pushUser(text: string) {
    setMessages(prev => [...prev, { role: "user", text }]);
  }

  const recognitionRef = useRef<any | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  function handleSend(qIn?: string) {
    const q = (qIn ?? input).trim();
    if (!q) return;
    pushUser(q);
    setInput("");

    const lq = q.toLowerCase();
    if (lq.includes("nearest") || lq.includes("near") || lq.includes("blood bank") || lq.includes("hospital")) {
      pushBot("Enter your city to find nearby blood banks.");
      return;
    }
    if (lq.includes("eligibility") || lq.includes("eligible") || lq.includes("donate")) {
      pushBot("Enter your age, days since last donation, and hemoglobin (optional). Use the form below.");
      return;
    }
    if (lq.includes("register") || lq.includes("donor")) {
      pushBot("Opening donor registration.");
      navigate("/register-donor");
      return;
    }
    if (lq.includes("faq") || lq.includes("question") || lq.includes("info")) {
      pushBot("Common FAQs: Who can donate? Healthy adults 18–65. How often? Every 56 days. How long does donation take? About 30–45 minutes including screening.");
      return;
    }
    pushBot("I can help with blood banks, eligibility, donor registration, and FAQs. Try asking: ‘Find nearest blood bank’ or ‘Am I eligible to donate?’.");
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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open ? (
        <Button className="rounded-full h-12 w-12 p-0 shadow-lg" onClick={() => setOpen(true)}>
          <MessageCircle className="h-5 w-5" />
        </Button>
      ) : (
        <Card className="w-[360px] max-h-[80vh] h-[75vh] flex flex-col shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Badge>AI</Badge> BloodBridge Bot</CardTitle>
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
                  <div key={i} className={m.role === "bot" ? "bg-muted/50 p-2 rounded" : "p-2 rounded"}>{m.text}</div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Type a question" value={input} onChange={(e) => setInput(e.target.value)} />
                <Button variant={voiceActive ? "destructive" : "outline"} size="icon" onClick={toggleVoice}>
                  <Mic className="h-4 w-4" />
                </Button>
                <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
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
                <Button variant="outline" className="flex items-center gap-2" onClick={() => pushBot("Common FAQs: Who can donate? Healthy adults 18–65. How often? Every 56 days. How long does it take? 30–45 minutes including screening.")}> 
                  <Info className="h-4 w-4" /> FAQs
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Find Approved Camps by City</div>
              <div className="flex gap-2">
                <Input placeholder="Enter city" value={findingCity} onChange={(e) => setFindingCity(e.target.value)} />
                <Button onClick={handleFindNearby}>Search</Button>
              </div>
              {findResults.length > 0 && (
                <div className="space-y-2">
                  {(showAllResults ? findResults : findResults.slice(0, 5)).map((r, idx) => (
                    <div key={idx} className="text-sm">
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
              <Button onClick={handleEligibilityCheck}>Check</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}