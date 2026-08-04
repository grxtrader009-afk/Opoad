import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Mic, MicOff, Send, Volume2, VolumeX, Brain, Code as Code2, Briefcase, Microscope, TrendingUp, Rocket, Film, Terminal, CircleCheck as CheckCircle2, Circle as XCircle, Clock, Trash2, Sparkles, Loader as Loader2, ChevronRight, Activity, Zap, Shield, FileText, ListTodo, Cpu } from "lucide-react";
import { processAgentQuery, type AiAgentMessage, type AiActionRequest } from "@/lib/ai.functions";
import { supabase } from "@/lib/supabase";

/* ═══════════════════════════════════════════════════════════════ */
/* TYPES & CONFIG                                                   */
/* ═══════════════════════════════════════════════════════════════ */

interface ChatMessage extends AiAgentMessage {
  id: string;
  timestamp: number;
  actions?: AiActionRequest[];
  pendingAction?: boolean;
}

const AGENT_MODES = [
  { key: "personal", label: "Assistant", icon: Bot, color: "#38bdf8" },
  { key: "developer", label: "Developer", icon: Code2, color: "#a78bfa" },
  { key: "business", label: "Business", icon: Briefcase, color: "#34d399" },
  { key: "research", label: "Research", icon: Microscope, color: "#fbbf24" },
  { key: "trading", label: "Trading", icon: TrendingUp, color: "#f472b6" },
  { key: "startup", label: "Startup", icon: Rocket, color: "#fb923c" },
  { key: "content", label: "Creator", icon: Film, color: "#22d3ee" },
  { key: "coding", label: "Coding", icon: Terminal, color: "#94a3b8" },
] as const;

type AgentMode = (typeof AGENT_MODES)[number]["key"];

/* ═══════════════════════════════════════════════════════════════ */
/* HOLOGRAPHIC AI CORE (CSS-based for smooth performance)           */
/* ═══════════════════════════════════════════════════════════════ */

function HolographicCore({ speaking, thinking }: { speaking: boolean; thinking: boolean }) {
  const state = speaking ? "speaking" : thinking ? "thinking" : "idle";

  return (
    <div className="relative flex h-44 w-44 items-center justify-center">
      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl animate-ai-breathe" />

      {/* Rotating ring 1 (horizontal) */}
      <div className="absolute h-40 w-40 rounded-full border border-cyan-400/20 animate-ai-ring-1" />
      {/* Rotating ring 2 (tilted) */}
      <div
        className="absolute h-36 w-36 rounded-full border border-blue-400/25 animate-ai-ring-2"
        style={{ transform: "rotateX(60deg)" }}
      />
      {/* Rotating ring 3 (vertical) */}
      <div
        className="absolute h-32 w-32 rounded-full border border-cyan-300/20 animate-ai-ring-3"
        style={{ transform: "rotateY(70deg)" }}
      />

      {/* Dashed orbit ring */}
      <div className="absolute h-44 w-44 rounded-full border border-dashed border-cyan-500/15 animate-ai-orbit" />

      {/* Core sphere */}
      <div className="relative h-20 w-20 rounded-full animate-ai-breathe">
        {/* Glass sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 via-blue-500/20 to-slate-900/40 backdrop-blur-md border border-cyan-300/30 shadow-[0_0_30px_rgba(56,189,248,0.3)]" />

        {/* Inner glow */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-cyan-500/20 via-transparent to-blue-400/20"
          style={{
            animation: `aiPulse ${speaking ? "0.6s" : thinking ? "1s" : "3s"} ease-in-out infinite`,
          }}
        />

        {/* Light reflection */}
        <div className="absolute left-3 top-2 h-4 w-6 rounded-full bg-white/30 blur-[3px]" />

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          {state === "speaking" ? (
            <VoiceWave />
          ) : state === "thinking" ? (
            <Loader2 size={20} className="text-cyan-300 animate-spin" />
          ) : (
            <Brain size={20} className="text-cyan-300/80 animate-ai-float" />
          )}
        </div>
      </div>

      {/* Energy particles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: 3,
            height: 3,
            animation: `aiParticle ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
            boxShadow: "0 0 6px rgba(56,189,248,0.8)",
          }}
        />
      ))}

      <style>{`
        @keyframes aiPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes aiParticle {
          0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translate(${(0)}px, -70px) scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function VoiceWave() {
  return (
    <div className="flex items-end gap-0.5 h-6">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1 rounded-full bg-cyan-300"
          style={{
            animation: `voiceBar 0.5s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.08}s`,
            height: "100%",
            minHeight: 4,
            boxShadow: "0 0 4px rgba(56,189,248,0.6)",
          }}
        />
      ))}
      <style>{`
        @keyframes voiceBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* MAIN PANEL                                                        */
/* ═══════════════════════════════════════════════════════════════ */

export function AiAssistantPanel() {
  const [mode, setMode] = useState<AgentMode>("personal");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [pendingActions, setPendingActions] = useState<
    Record<string, "pending" | "approved" | "denied" | "executed" | "failed">
  >({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<unknown>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  /* Initialize session in Supabase */
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data } = await supabase
          .from("ai_sessions")
          .insert({ mode: "personal" })
          .select("id")
          .single();
        if (data) setSessionId(data.id);
      } catch {
        // Non-fatal — chat still works without persistence
      }
    };
    initSession();
  }, []);

  /* Load speech synthesis */
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  /* Auto-scroll */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  /* Persist messages to Supabase */
  const persistMessage = useCallback(
    async (role: string, content: string, actions?: AiActionRequest[]) => {
      if (!sessionId) return;
      try {
        await supabase.from("ai_messages").insert({
          session_id: sessionId,
          role,
          content,
          action_requests: actions ?? null,
        });
      } catch {
        // Non-fatal
      }
    },
    [sessionId],
  );

  /* Speak text via Web Speech API */
  const speak = useCallback(
    (text: string) => {
      if (!voiceEnabled || !synthRef.current) return;
      synthRef.current.cancel();
      const cleanText = text.replace(/[*#`|]/g, "").slice(0, 500);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      synthRef.current.speak(utterance);
    },
    [voiceEnabled],
  );

  /* Send query to AI agent */
  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: query,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);
      setThinking(true);

      const history: AiAgentMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await processAgentQuery({
          data: { query, history, mode },
        });

        setThinking(false);

        const aiMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: res.response,
          timestamp: Date.now(),
          actions: res.actionRequests?.length ? res.actionRequests : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);

        persistMessage("user", query);
        persistMessage("assistant", res.response, res.actionRequests);

        speak(res.response);
      } catch (err) {
        setThinking(false);
        const errMsg = err instanceof Error ? err.message : "Failed to get response.";
        const errChat: ChatMessage = {
          id: `e-${Date.now()}`,
          role: "assistant",
          content: `I encountered an issue: ${errMsg}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errChat]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages, mode, persistMessage, speak],
  );

  /* Voice input via Web Speech API */
  const toggleListening = useCallback(() => {
    if (listening) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setListening(false);
      return;
    }

    const SR =
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

    if (!SR) {
      window.alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new (SR as new () => {
      lang: string;
      interimResults: boolean;
      continuous: boolean;
      onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
      onend: () => void;
      onerror: () => void;
      start: () => void;
      stop: () => void;
    })();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      sendQuery(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening, sendQuery]);

  /* Handle action confirmation */
  const handleAction = useCallback(
    async (action: AiActionRequest, approved: boolean) => {
      setPendingActions((prev) => ({
        ...prev,
        [action.id]: approved ? "approved" : "denied",
      }));

      if (!approved) {
        const denyMsg: ChatMessage = {
          id: `d-${Date.now()}`,
          role: "assistant",
          content: `Understood. I will not proceed with: ${action.description}.`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, denyMsg]);
        return;
      }

      /* Execute the action */
      setPendingActions((prev) => ({ ...prev, [action.id]: "executed" }));

      const execMsg: ChatMessage = {
        id: `x-${Date.now()}`,
        role: "assistant",
        content: `Executing: ${action.description}\n\n${action.details}\n\nStatus: This action has been queued for execution. In a browser environment, system-level operations require the desktop companion app.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, execMsg]);

      /* Log action to Supabase */
      if (sessionId) {
        try {
          await supabase.from("ai_action_log").insert({
            session_id: sessionId,
            action_type: action.type,
            description: action.description,
            details: action.details,
            status: approved ? "approved" : "denied",
          });
        } catch {
          // Non-fatal
        }
      }
    },
    [sessionId],
  );

  const currentMode = useMemo(
    () => AGENT_MODES.find((m) => m.key === mode) ?? AGENT_MODES[0],
    [mode],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    if (synthRef.current) synthRef.current.cancel();
    setSpeaking(false);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Holographic Core ── */}
      <div className="relative flex flex-col items-center justify-center py-2">
        <HolographicCore speaking={speaking} thinking={thinking} />
        <div className="mt-2 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
            OPOAD AI Core
          </p>
          <p className="font-mono text-[9px] text-slate-500 mt-0.5">
            {thinking ? "Processing..." : speaking ? "Speaking..." : "Online · Ready"}
          </p>
        </div>
      </div>

      {/* ── Mode Selector ── */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {AGENT_MODES.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMode(m.key)}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider transition-all ${
                isActive
                  ? "border bg-slate-900/60 text-slate-100"
                  : "border border-slate-800 bg-slate-950/40 text-slate-500 hover:text-slate-300"
              }`}
              style={
                isActive
                  ? { borderColor: `${m.color}50`, color: m.color, boxShadow: `0 0 10px ${m.color}20` }
                  : undefined
              }
            >
              <Icon size={10} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Chat Messages ── */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto max-h-[280px] min-h-[180px] pr-1 ai-scroll"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Sparkles size={20} className="text-cyan-400/50" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 text-center">
              {currentMode.label} Mode Active
            </p>
            <p className="text-[11px] text-slate-600 text-center max-w-[260px]">
              Ask me anything in Hindi, English, or Hinglish. I can answer questions,
              generate content, analyze code, and execute tasks with your confirmation.
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 ${
                  msg.role === "user"
                    ? "bg-cyan-500/10 border border-cyan-400/20 text-slate-100"
                    : "bg-slate-900/50 border border-slate-700/50 text-slate-200"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <div
                      className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: `${currentMode.color}20` }}
                    >
                      <Brain size={9} style={{ color: currentMode.color }} />
                    </div>
                    <span
                      className="font-mono text-[8px] uppercase tracking-wider"
                      style={{ color: currentMode.color }}
                    >
                      OPOAD AI
                    </span>
                  </div>
                )}
                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                {/* Action requests */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.actions.map((action) => {
                      const status = pendingActions[action.id] ?? "pending";
                      return (
                        <div
                          key={action.id}
                          className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-2.5"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Shield size={11} className="text-amber-400" />
                            <span className="font-mono text-[9px] uppercase tracking-wider text-amber-400">
                              Action Requires Confirmation
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-200 mb-1">{action.description}</p>
                          <p className="text-[10px] text-slate-500 mb-2">{action.details}</p>
                          {status === "pending" ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAction(action, true)}
                                className="flex items-center gap-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-emerald-400 hover:bg-emerald-500/25 transition"
                              >
                                <CheckCircle2 size={10} />
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(action, false)}
                                className="flex items-center gap-1 rounded-lg bg-red-500/15 border border-red-500/30 px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-red-400 hover:bg-red-500/25 transition"
                              >
                                <XCircle size={10} />
                                Deny
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {status === "executed" && (
                                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-400">
                                  <CheckCircle2 size={10} /> Executed
                                </span>
                              )}
                              {status === "denied" && (
                                <span className="flex items-center gap-1 text-[9px] font-mono text-red-400">
                                  <XCircle size={10} /> Denied
                                </span>
                              )}
                              {status === "approved" && (
                                <span className="flex items-center gap-1 text-[9px] font-mono text-amber-400">
                                  <Loader2 size={10} className="animate-spin" /> Processing
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-1 flex items-center gap-1">
                  <span className="font-mono text-[8px] text-slate-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {msg.role === "assistant" && voiceEnabled && (
                    <button
                      onClick={() => speak(msg.content)}
                      className="ml-auto text-slate-600 hover:text-cyan-400 transition"
                    >
                      <Volume2 size={10} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                      style={{
                        animation: `aiDot 1s ease-in-out infinite`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
                <span className="font-mono text-[9px] text-slate-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => sendQuery("Analyze my current project and suggest improvements")}
          className="rounded-full border border-slate-800 bg-slate-950/40 px-2.5 py-1 text-[9px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition"
        >
          <Cpu size={9} className="inline mr-1" />
          Analyze Project
        </button>
        <button
          onClick={() => sendQuery("Generate a business idea for a tech startup")}
          className="rounded-full border border-slate-800 bg-slate-950/40 px-2.5 py-1 text-[9px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition"
        >
          <Briefcase size={9} className="inline mr-1" />
          Business Idea
        </button>
        <button
          onClick={() => sendQuery("Create a to-do list for today")}
          className="rounded-full border border-slate-800 bg-slate-950/40 px-2.5 py-1 text-[9px] font-mono text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition"
        >
          <ListTodo size={9} className="inline mr-1" />
          To-Do List
        </button>
        <button
          onClick={clearChat}
          className="ml-auto rounded-full border border-slate-800 bg-slate-950/40 px-2.5 py-1 text-[9px] font-mono text-slate-400 hover:text-red-400 hover:border-red-500/30 transition"
        >
          <Trash2 size={9} className="inline mr-1" />
          Clear
        </button>
      </div>

      {/* ── Input Bar ── */}
      <div className="flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-slate-950/60 backdrop-blur-md p-2">
        <button
          onClick={toggleListening}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shrink-0 ${
            listening
              ? "bg-red-500/20 border border-red-500/40 text-red-400 animate-pulse"
              : "bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-cyan-300"
          }`}
          aria-label={listening ? "Stop listening" : "Start voice input"}
        >
          {listening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendQuery(input);
            }
          }}
          placeholder="Speak or type in Hindi, English, Hinglish..."
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none min-w-0"
          disabled={loading}
        />

        <button
          onClick={() => setVoiceEnabled((v) => !v)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all shrink-0 ${
            voiceEnabled
              ? "bg-cyan-500/15 border border-cyan-500/30 text-cyan-400"
              : "bg-slate-800/50 border border-slate-700/50 text-slate-500"
          }`}
          aria-label={voiceEnabled ? "Disable voice output" : "Enable voice output"}
        >
          {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        <button
          onClick={() => sendQuery(input)}
          disabled={!input.trim() || loading}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-40 transition-all shrink-0"
          aria-label="Send"
        >
          <Send size={15} />
        </button>
      </div>

      {/* ── Status Bar ── */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            Online
          </span>
          <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-cyan-400/60">
            <Activity size={8} />
            {currentMode.label}
          </span>
          <span className="flex items-center gap-1 font-mono text-[8px] uppercase tracking-wider text-slate-500">
            <Zap size={8} />
            {messages.length} msgs
          </span>
        </div>
        <span className="font-mono text-[8px] text-slate-600">
          Gemini · Session {sessionId ? "Active" : "Local"}
        </span>
      </div>

      <style>{`
        @keyframes aiDot {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .ai-scroll::-webkit-scrollbar { width: 4px; }
        .ai-scroll::-webkit-scrollbar-track { background: transparent; }
        .ai-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}
