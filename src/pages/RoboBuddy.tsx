import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  ToggleLeft,
  ToggleRight,
  Phone,
  Car,
  UtensilsCrossed,
  Hotel,
  Cross,
  AlertTriangle,
  Zap,
} from "lucide-react";

interface Message {
  id: number;
  role: "user" | "bot";
  text: string;
  actions?: QuickAction[];
}

interface QuickAction {
  label: string;
  url?: string;
  icon?: typeof Phone;
}

// Intent detection for golf and senior-friendly queries
function detectIntent(input: string): Message {
  const lower = input.toLowerCase().trim();

  // Golf-specific intents
  if (/tee\s*time|book.*(round|tee)|reserve/i.test(lower)) {
    return reply(
      "I can help you find tee times! Here are some options near you. Check out our Find Courses page for real-time availability and hot deals.",
      [{ label: "Find Courses", url: "/courses" }]
    );
  }
  if (/swing|coach|lesson|posture|grip/i.test(lower)) {
    return reply(
      "Great question about your swing! Our AI Swing Coach can analyze your form with video feedback. Want to try it?",
      [{ label: "AI Swing Coach", url: "/swing" }]
    );
  }
  if (/score|tournament|leaderboard|pga|masters/i.test(lower)) {
    return reply(
      "I've got live tournament info for you! Check out real-time leaderboards and scores.",
      [
        { label: "Tournaments", url: "/tournaments" },
        { label: "PGA Tour", url: "/pga" },
      ]
    );
  }
  if (/weather|rain|wind|forecast/i.test(lower)) {
    return reply(
      "Checking golf weather... Today looks great for a round! Low wind, sunny skies expected. Always check the forecast before heading out.",
      []
    );
  }
  if (/gps|yardage|distance|range\s*finder|slope/i.test(lower)) {
    return reply(
      "Our Golf GPS gives you accurate yardage, slope adjustments, and wind data. Let's get you dialed in!",
      [{ label: "Golf GPS", url: "/gps" }]
    );
  }
  if (/deal|discount|equipment|club|ball|gear|shop/i.test(lower)) {
    return reply(
      "Looking for gear deals? We have today's best equipment discounts ready for you!",
      [{ label: "Equipment Deals", url: "/deals" }]
    );
  }
  if (/buddy|partner|play\s*with|friend|group|foursome/i.test(lower)) {
    return reply(
      "Let's find you a playing buddy! Connect with golfers in your area and schedule a round together.",
      [{ label: "Let's Play Buddy", url: "/buddy" }]
    );
  }
  if (/kid|junior|child|young|son|daughter/i.test(lower)) {
    return reply(
      "We love junior golfers! Check out KidsLoveGolf for coaching tips, fun drills, and programs for young players.",
      [{ label: "KidsLoveGolf", url: "/kids" }]
    );
  }
  if (/video|watch|highlight|clip/i.test(lower)) {
    return reply("Here are this week's top golf videos and highlights!", [
      { label: "Top Videos", url: "/videos" },
    ]);
  }
  if (/podcast|listen|show|episode/i.test(lower)) {
    return reply("Check out the latest golf podcasts and shows!", [
      { label: "Golf Podcasts", url: "/podcasts" },
    ]);
  }
  if (/news|headline|article/i.test(lower)) {
    return reply("Here's what's happening in the golf world today!", [
      { label: "Golf News", url: "/news" },
    ]);
  }

  // Senior / travel intents
  if (/uber|lyft|ride|taxi|cab|pickup/i.test(lower)) {
    return reply("I'll help you get a ride right away!", [
      { label: "Open Uber", url: "https://m.uber.com", icon: Car },
      { label: "Open Lyft", url: "https://www.lyft.com", icon: Car },
    ]);
  }
  if (/restaurant|food|eat|dinner|lunch|breakfast|hungry/i.test(lower)) {
    return reply(
      "Let me find nearby restaurants for you! Here are some popular options:",
      [
        {
          label: "Find Restaurants",
          url: "https://www.google.com/maps/search/restaurants+near+me",
          icon: UtensilsCrossed,
        },
      ]
    );
  }
  if (/hotel|stay|lodge|motel|accommodation|sleep/i.test(lower)) {
    return reply("Looking for a place to stay? Let me help!", [
      {
        label: "Find Hotels",
        url: "https://www.google.com/maps/search/hotels+near+me",
        icon: Hotel,
      },
    ]);
  }
  if (/urgent\s*care|doctor|hospital|medical|emergency|hurt|pain|injured/i.test(lower)) {
    return reply(
      "I hope you're okay! Here's how to find urgent care nearby. If it's a real emergency, please call 911.",
      [
        {
          label: "Find Urgent Care",
          url: "https://www.google.com/maps/search/urgent+care+near+me",
          icon: Cross,
        },
        { label: "Call 911", url: "tel:911", icon: Phone },
      ]
    );
  }
  if (/help|lost|confused|don'?t\s*know/i.test(lower)) {
    return reply(
      "I'm here to help! You can ask me about:\n• Finding golf courses & tee times\n• Swing tips & AI coaching\n• Live tournament scores\n• Equipment deals\n• GPS & yardage\n• Rides, restaurants, hotels\n• Urgent care nearby\n\nJust type or tap the mic and ask!",
      []
    );
  }
  if (/hello|hi|hey|good\s*(morning|afternoon|evening)/i.test(lower)) {
    return reply(
      "Hey there, golf buddy! I'm RoboBuddy, your AI caddie. Ask me anything about golf, or I can help you find rides, restaurants, hotels, and more. What can I do for you?",
      []
    );
  }

  // Default fallback
  return reply(
    "I'm not sure about that one, but I'm always learning! Try asking about tee times, swing tips, tournaments, equipment deals, or I can help with rides, restaurants, and hotels.",
    []
  );
}

function reply(text: string, actions: QuickAction[]): Message {
  return { id: Date.now(), role: "bot", text, actions };
}

const quickPrompts = [
  "Find tee times near me",
  "Help with my swing",
  "Live tournament scores",
  "Equipment deals today",
  "Get a ride",
  "Find restaurants",
];

const seniorQuickPrompts = [
  "I need a ride",
  "Find restaurants nearby",
  "Find a hotel",
  "Urgent care near me",
  "Help me",
  "Find golf courses",
];

export default function RoboBuddy() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "Hey! I'm RoboBuddy, your AI golf caddie. Ask me anything — tee times, swing tips, scores, deals, or even help finding rides and restaurants!",
      actions: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [seniorMode, setSeniorMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: text.trim(),
    };
    const botResponse = detectIntent(text);
    setMessages((prev) => [...prev, userMsg, { ...botResponse, id: Date.now() + 1 }]);
    setInput("");
    inputRef.current?.focus();
  }

  function handleVoice() {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: "Sorry, voice input isn't supported in this browser. Try typing your question instead!",
        },
      ]);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  }

  const textSize = seniorMode ? "text-lg" : "text-sm";
  const btnSize = seniorMode ? "p-4" : "p-2.5";
  const prompts = seniorMode ? seniorQuickPrompts : quickPrompts;

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      {/* Header */}
      <div
        className="sticky top-0 z-20 bg-gradient-to-r from-green-800 to-emerald-900 shadow-lg"
        style={{ paddingTop: "max(0px, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="text-white" size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <Bot size={18} className="text-white" />
            </div>
            <h1
              className={`font-extrabold text-white ${seniorMode ? "text-2xl" : "text-lg"}`}
            >
              RoboBuddy
            </h1>
          </div>
          {/* Senior Mode Toggle */}
          <button
            onClick={() => setSeniorMode(!seniorMode)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10"
            title="Senior Mode"
          >
            <span className={`text-white font-bold ${seniorMode ? "text-sm" : "text-[10px]"}`}>
              {seniorMode ? "Sr" : "Sr"}
            </span>
            {seniorMode ? (
              <ToggleRight size={22} className="text-amber-400" />
            ) : (
              <ToggleLeft size={18} className="text-white/50" />
            )}
          </button>
        </div>
      </div>

      {/* Senior Mode Panic / Quick Actions Bar */}
      {seniorMode && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <a
              href="tel:911"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white font-extrabold text-base py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <AlertTriangle size={20} />
              911
            </a>
            <a
              href="https://m.uber.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-black text-white font-bold text-sm py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Car size={18} />
              Uber
            </a>
            <a
              href="https://www.google.com/maps/search/restaurants+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-green-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <UtensilsCrossed size={18} />
              Food
            </a>
            <a
              href="https://www.google.com/maps/search/urgent+care+near+me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 bg-blue-700 text-white font-bold text-sm py-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              <Cross size={18} />
              Care
            </a>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 pb-48 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] ${
                msg.role === "user"
                  ? "bg-green-600 text-white rounded-2xl rounded-br-md"
                  : "bg-gray-800 text-gray-100 rounded-2xl rounded-bl-md"
              } px-4 py-3 shadow-md`}
            >
              <div className="flex items-start gap-2">
                {msg.role === "bot" && (
                  <Bot size={seniorMode ? 22 : 16} className="text-amber-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <p className={`${textSize} leading-relaxed whitespace-pre-line`}>
                    {msg.text}
                  </p>
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.actions.map((action, i) => {
                        const ActionIcon = action.icon || Zap;
                        if (action.url?.startsWith("http") || action.url?.startsWith("tel:")) {
                          return (
                            <a
                              key={i}
                              href={action.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-400 font-bold rounded-full px-3 ${
                                seniorMode ? "py-2 text-sm" : "py-1.5 text-xs"
                              } hover:bg-green-500/30 transition-colors`}
                            >
                              <ActionIcon size={14} />
                              {action.label}
                            </a>
                          );
                        }
                        return (
                          <button
                            key={i}
                            onClick={() => action.url && navigate(action.url)}
                            className={`inline-flex items-center gap-1.5 bg-green-500/20 border border-green-500/40 text-green-400 font-bold rounded-full px-3 ${
                              seniorMode ? "py-2 text-sm" : "py-1.5 text-xs"
                            } hover:bg-green-500/30 transition-colors`}
                          >
                            <ActionIcon size={14} />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <User size={seniorMode ? 22 : 16} className="text-green-200 mt-0.5 shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="fixed bottom-36 left-0 right-0 z-10 px-3">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className={`shrink-0 bg-gray-800/90 backdrop-blur border border-gray-700 text-gray-300 font-medium rounded-full px-3 ${
                  seniorMode ? "py-2.5 text-sm" : "py-2 text-xs"
                } hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap`}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-20 bg-gray-900/95 backdrop-blur border-t border-gray-800 px-3 py-3">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button
            onClick={handleVoice}
            className={`${btnSize} rounded-full ${
              isListening
                ? "bg-red-500 animate-pulse"
                : "bg-gray-700 hover:bg-gray-600"
            } transition-colors`}
          >
            {isListening ? (
              <MicOff size={seniorMode ? 24 : 18} className="text-white" />
            ) : (
              <Mic size={seniorMode ? 24 : 18} className="text-white" />
            )}
          </button>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder={
              seniorMode ? "Ask me anything..." : "Ask RoboBuddy..."
            }
            className={`flex-1 bg-gray-800 border border-gray-700 rounded-full px-4 ${
              seniorMode ? "py-3 text-lg" : "py-2.5 text-sm"
            } text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500`}
          />
          <button
            onClick={() => sendMessage(input)}
            className={`${btnSize} rounded-full bg-green-600 hover:bg-green-500 transition-colors active:scale-95`}
          >
            <Send size={seniorMode ? 24 : 18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
