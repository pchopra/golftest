import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mic, MicOff, Phone, Car, Calendar, Users, MessageCircle,
  AlertTriangle, MapPin, Volume2, X, Check, Loader2, ChevronRight,
} from 'lucide-react';

interface AssistantAction {
  id: string;
  label: string;
  description: string;
  icon: typeof Phone;
  color: string;
  bgColor: string;
  action: () => void;
}

// ─── Voice Command Hook ───
function useVoiceCommand(onResult: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const supported = !!SR;

  const toggle = () => {
    if (!supported) return;
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setListening(false);
    } else {
      // Create a fresh instance each time to avoid stale-object issues
      const recognition = new SR();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onResultRef.current(text);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    }
  };

  return { listening, supported, toggle };
}

// ─── Text-to-Speech ───
function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.9;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  }
}

// ─── Voice Command Matcher ───
function matchCommand(text: string): string | null {
  const t = text.toLowerCase();
  if (t.includes('emergency') || t.includes('help') || t.includes('sos') || t.includes('panic'))
    return 'emergency';
  if (t.includes('ride') || t.includes('uber') || t.includes('lyft') || t.includes('pickup') || t.includes('pick me up'))
    return 'ride';
  if (t.includes('available') || t.includes('who') || t.includes('free') || t.includes('playing'))
    return 'find-buddies';
  if (t.includes('tee time') || t.includes('book') || t.includes('reserve'))
    return 'tee-time';
  if (t.includes('chat') || t.includes('group') || t.includes('message') || t.includes('text'))
    return 'chat';
  if (t.includes('call') || t.includes('phone'))
    return 'call';
  if (t.includes('course') || t.includes('find') || t.includes('nearby') || t.includes('where'))
    return 'courses';
  return null;
}

export default function SeniorAssistant() {
  const navigate = useNavigate();
  const [voiceText, setVoiceText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState(() => {
    try { return JSON.parse(localStorage.getItem('emergencyContact') || '""'); } catch { return ''; }
  });
  const [editingEmergency, setEditingEmergency] = useState(false);
  const [emergencyInput, setEmergencyInput] = useState(emergencyContact);
  const [processing, setProcessing] = useState(false);

  const handleVoiceResult = (text: string) => {
    setVoiceText(text);
    setProcessing(true);
    const cmd = matchCommand(text);

    setTimeout(() => {
      setProcessing(false);
      if (cmd) {
        const labels: Record<string, string> = {
          'emergency': 'Calling for help now!',
          'ride': 'Opening ride request...',
          'find-buddies': 'Checking who\'s available...',
          'tee-time': 'Let\'s book a tee time!',
          'chat': 'Opening your chat groups...',
          'call': 'Opening phone...',
          'courses': 'Finding courses near you...',
        };
        const msg = labels[cmd] || 'Got it!';
        setFeedback(msg);
        speak(msg);

        setTimeout(() => {
          if (cmd === 'emergency') setShowEmergencyConfirm(true);
          else if (cmd === 'find-buddies') navigate('/buddy');
          else if (cmd === 'tee-time') navigate('/buddy');
          else if (cmd === 'chat') navigate('/buddy');
          else if (cmd === 'courses') navigate('/courses');
          else if (cmd === 'ride') handleRideRequest();
          else if (cmd === 'call') handleCallEmergencyContact();
        }, 1200);
      } else {
        const msg = `I heard "${text}". Try saying something like "Who's available today?" or "I need a ride."`;
        setFeedback(msg);
        speak(msg);
      }
    }, 600);
  };

  const { listening, supported, toggle } = useVoiceCommand(handleVoiceResult);

  const handleRideRequest = () => {
    // Deep-link to Uber
    const uberUrl = 'https://m.uber.com/ul/';
    window.open(uberUrl, '_blank');
  };

  const handleCallEmergencyContact = () => {
    if (emergencyContact) {
      window.location.href = `tel:${emergencyContact}`;
    } else {
      setFeedback('Please set your emergency contact first.');
      speak('Please set your emergency contact first.');
      setEditingEmergency(true);
    }
  };

  const handleEmergency = () => {
    setShowEmergencyConfirm(false);
    // Try to get location and call emergency contact
    if (emergencyContact) {
      window.location.href = `tel:${emergencyContact}`;
    }
    // Also try to send SMS with location via sms: protocol
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapLink = `https://maps.google.com/maps?q=${latitude},${longitude}`;
          if (emergencyContact) {
            window.location.href = `sms:${emergencyContact}?body=EMERGENCY! I need help. My location: ${mapLink}`;
          }
        },
        () => {
          // Location failed, still try to call
          if (emergencyContact) {
            window.location.href = `tel:${emergencyContact}`;
          }
        }
      );
    }
  };

  const saveEmergencyContact = () => {
    localStorage.setItem('emergencyContact', JSON.stringify(emergencyInput));
    setEmergencyContact(emergencyInput);
    setEditingEmergency(false);
    speak('Emergency contact saved.');
  };

  const actions: AssistantAction[] = [
    {
      id: 'emergency',
      label: 'SOS Emergency',
      description: 'Call emergency contact & share location',
      icon: AlertTriangle,
      color: 'text-white',
      bgColor: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
      action: () => setShowEmergencyConfirm(true),
    },
    {
      id: 'call-contact',
      label: 'Call My Contact',
      description: 'Quick-call your emergency contact',
      icon: Phone,
      color: 'text-white',
      bgColor: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
      action: handleCallEmergencyContact,
    },
    {
      id: 'find-buddies',
      label: "Who's Available?",
      description: 'See who can play today or this weekend',
      icon: Users,
      color: 'text-white',
      bgColor: 'bg-green-600 hover:bg-green-700 active:bg-green-800',
      action: () => navigate('/buddy'),
    },
    {
      id: 'tee-time',
      label: 'Book Tee Time',
      description: 'Set up a round at your favorite course',
      icon: Calendar,
      color: 'text-white',
      bgColor: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800',
      action: () => navigate('/buddy'),
    },
    {
      id: 'chat',
      label: 'Chat With Buddies',
      description: 'Message your golf friends group',
      icon: MessageCircle,
      color: 'text-white',
      bgColor: 'bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700',
      action: () => navigate('/buddy'),
    },
    {
      id: 'ride',
      label: 'Get a Ride',
      description: 'Request Uber to the course',
      icon: Car,
      color: 'text-white',
      bgColor: 'bg-gray-800 hover:bg-gray-900 active:bg-black',
      action: handleRideRequest,
    },
    {
      id: 'courses',
      label: 'Find Courses',
      description: 'Courses near you with directions',
      icon: MapPin,
      color: 'text-white',
      bgColor: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800',
      action: () => navigate('/courses'),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 px-4 pt-2 pb-6"
        style={{ paddingTop: "max(12px, env(safe-area-inset-top))" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Senior Golf Concierge</h1>
            <p className="text-orange-100 text-xs font-medium">Your voice-powered golf assistant</p>
          </div>
          {/* Emergency Contact Setup */}
          <button
            onClick={() => setEditingEmergency(true)}
            className="px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold"
          >
            {emergencyContact ? '📞 Contact Set' : '⚙️ Set Contact'}
          </button>
        </div>

        {/* Voice Command Area */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
          <p className="text-white/90 text-sm font-semibold text-center mb-3">
            {listening ? '🎙️ Listening... speak now!' : 'Tap the mic and tell me what you need'}
          </p>

          {/* Mic Button */}
          <div className="flex justify-center mb-3">
            <button
              onClick={toggle}
              disabled={!supported}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 ${
                listening
                  ? 'bg-red-500 animate-pulse shadow-red-500/50'
                  : supported
                    ? 'bg-white shadow-white/30 hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {listening ? (
                <MicOff size={36} className="text-white" />
              ) : (
                <Mic size={36} className={supported ? 'text-orange-500' : 'text-gray-600'} />
              )}
            </button>
          </div>

          {!supported && (
            <p className="text-center text-yellow-200 text-xs font-medium">
              Voice not supported in this browser. Use the buttons below instead.
            </p>
          )}

          {/* Voice Feedback */}
          {(voiceText || feedback || processing) && (
            <div className="mt-2 p-3 rounded-xl bg-white/10">
              {voiceText && (
                <p className="text-white text-sm font-medium mb-1">
                  <Volume2 size={14} className="inline mr-1" /> You said: "{voiceText}"
                </p>
              )}
              {processing && (
                <p className="text-yellow-200 text-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Understanding...
                </p>
              )}
              {feedback && !processing && (
                <p className="text-green-200 text-sm font-semibold">{feedback}</p>
              )}
            </div>
          )}

          {/* Voice Command Examples */}
          <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
            {[
              '"Who\'s playing today?"',
              '"I need a ride"',
              '"Book a tee time"',
              '"Emergency help"',
            ].map(example => (
              <span key={example} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-[11px] font-medium">
                {example}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 -mt-3">
        <div className="grid grid-cols-1 gap-3">
          {actions.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={a.action}
                className={`${a.bgColor} rounded-2xl p-5 flex items-center gap-4 shadow-lg transition-all active:scale-[0.98] ${
                  a.id === 'emergency' ? 'ring-2 ring-red-300' : ''
                }`}
              >
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={28} className={a.color} />
                </div>
                <div className="text-left flex-1">
                  <h3 className={`text-lg font-bold ${a.color}`}>{a.label}</h3>
                  <p className="text-white/80 text-sm">{a.description}</p>
                </div>
                <ChevronRight size={20} className="text-white/50" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Confirmation Modal */}
      {showEmergencyConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Emergency SOS</h3>
              <p className="text-gray-600 text-sm mt-2">
                This will call your emergency contact and send your GPS location.
              </p>
            </div>
            {!emergencyContact && (
              <p className="text-amber-600 text-sm font-semibold text-center mb-3">
                ⚠️ No emergency contact set. Please set one first.
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEmergencyConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm"
              >
                Cancel
              </button>
              {emergencyContact ? (
                <button
                  onClick={handleEmergency}
                  className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm animate-pulse"
                >
                  🚨 CALL NOW
                </button>
              ) : (
                <button
                  onClick={() => { setShowEmergencyConfirm(false); setEditingEmergency(true); }}
                  className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm"
                >
                  Set Contact
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Contact Edit Modal */}
      {editingEmergency && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Emergency Contact</h3>
              <button onClick={() => setEditingEmergency(false)} className="p-1">
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Enter the phone number of someone to call in an emergency.
            </p>
            <input
              type="tel"
              value={emergencyInput}
              onChange={e => setEmergencyInput(e.target.value)}
              placeholder="e.g. 555-123-4567"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 text-lg font-semibold text-center focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none"
              autoFocus
            />
            <button
              onClick={saveEmergencyContact}
              disabled={!emergencyInput.trim()}
              className="w-full mt-4 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Save Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
