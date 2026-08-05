import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useCallback } from "react";
import { CinematicLoginScene } from "@/components/dashboard/CinematicLoginScene";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Loader as Loader2, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — OPCAD AI CORE" },
      { name: "description", content: "Enter the world's most advanced AI Operating System." },
    ],
  }),
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    const { supabase } = await import("@/lib/supabase");
    const { data } = await supabase.auth.getSession();
    if (data.session) { throw redirect({ to: "/" }); }
  },
  component: LoginPage,
});

// ─── Boot sequence messages ───────────────────────────────────────────────────
const BOOT_STEPS = [
  { text: "INITIALIZING OPCAD AI CORE...", pct: 12 },
  { text: "Connecting Quantum Network...", pct: 25 },
  { text: "Synchronizing Earth Satellites...", pct: 40 },
  { text: "Loading Artificial Intelligence...", pct: 54 },
  { text: "Connecting Neural Network...", pct: 67 },
  { text: "Loading Future Civilization...", pct: 80 },
  { text: "Global Intelligence Online...", pct: 92 },
  { text: "AI Consciousness Activated...", pct: 100 },
];

const TOTAL_BOOT_MS = 4200;

// ─── AI auth steps ────────────────────────────────────────────────────────────
const AUTH_STEPS = [
  "Initializing...",
  "Scanning Identity...",
  "Quantum Authentication...",
  "Neural Verification...",
  "Connecting Global Intelligence...",
];

// ─── Holographic tech modules ─────────────────────────────────────────────────
const TECH_MODULES = [
  { label: "AI ASSISTANT", icon: "🧠", delay: 0 },
  { label: "AUTOMATION", icon: "⚡", delay: 0.15 },
  { label: "RESEARCH", icon: "🔬", delay: 0.3 },
  { label: "SECURITY", icon: "🛡️", delay: 0.45 },
  { label: "QUANTUM", icon: "⚛️", delay: 0.6 },
  { label: "NEURAL NET", icon: "🕸️", delay: 0.75 },
  { label: "ANALYTICS", icon: "📊", delay: 0.9 },
  { label: "CLOUD", icon: "☁️", delay: 1.05 },
  { label: "ROBOTICS", icon: "🤖", delay: 1.2 },
  { label: "API CENTER", icon: "🔗", delay: 1.35 },
  { label: "FINANCE", icon: "💹", delay: 1.5 },
  { label: "MEDIA", icon: "🎬", delay: 1.65 },
];

// ─── BootScreen ───────────────────────────────────────────────────────────────
function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stepIdx, setStepIdx] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [fading, setFading] = useState(false);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min((elapsed / TOTAL_BOOT_MS) * 100, 100);
      setProgress(pct);

      // Advance step
      const nextStep = BOOT_STEPS.findLastIndex((s) => s.pct <= pct);
      setStepIdx(Math.max(0, nextStep));

      if (pct >= 100 && !doneRef.current) {
        doneRef.current = true;
        clearInterval(interval);
        setShowWelcome(true);
        setTimeout(() => setFading(true), 900);
        setTimeout(() => onComplete(), 1700);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070a] transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* Starfield */}
      <div className="absolute inset-0 starfield" />
      <div className="absolute inset-0 grid-overlay" />

      {/* Radial glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: "600px",
          height: "600px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          background:
            "radial-gradient(circle, rgba(0,217,255,0.12) 0%, rgba(0,217,255,0.04) 50%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8 px-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <img
            src="/opoad-logo-transparent.png"
            alt="OPCAD"
            className="h-14 w-auto object-contain"
            style={{
              filter:
                "brightness(1.8) drop-shadow(0 0 22px rgba(0,217,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.5)) drop-shadow(0 0 50px rgba(0,217,255,0.5))",
              animation: "breatheLogo 3s ease-in-out infinite",
            }}
          />
          <p className="font-mono text-[9px] tracking-[0.38em] text-sky-400/80">
            INTELLIGENCE · AUTOMATION · FUTURE
          </p>
        </div>

        {/* Messages */}
        <div className="flex flex-col gap-1 min-h-[200px] items-start w-full max-w-md">
          {BOOT_STEPS.slice(0, stepIdx + 1).map((step, i) => (
            <p
              key={i}
              className="font-mono text-xs text-left"
              style={{
                color: i === stepIdx ? "#4FD6FF" : "rgba(255,255,255,0.35)",
                textShadow:
                  i === stepIdx ? "0 0 12px rgba(79,214,255,0.7)" : "none",
                animation: i === stepIdx ? "bootLine 0.3s ease-out" : "none",
              }}
            >
              {i < stepIdx ? (
                <span className="text-emerald-400 mr-2">✓</span>
              ) : (
                <span className="mr-2 animate-pulse">▶</span>
              )}
              {step.text}
            </p>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-mono text-[10px] text-sky-400/60 tracking-widest">
              SYSTEM LOAD
            </span>
            <span className="font-mono text-[10px] text-sky-400/80">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #00D9FF, #4FD6FF, #80FFFF)",
                boxShadow: "0 0 10px rgba(79,214,255,0.8), 0 0 20px rgba(0,217,255,0.4)",
                transition: "width 0.1s linear",
              }}
            />
          </div>
          <div className="mt-2 font-mono text-[8px] tracking-[0.4em] text-white/20">
            ████████████████████████████████████████
          </div>
        </div>

        {/* Welcome message */}
        {showWelcome && (
          <div
            className="font-mono text-xl tracking-[0.3em] text-white"
            style={{
              textShadow: "0 0 20px rgba(0,217,255,0.9), 0 0 40px rgba(0,217,255,0.4)",
              animation: "welcomeFadeIn 0.6s ease-out",
            }}
          >
            WELCOME COMMANDER
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tech modules overlay ──────────────────────────────────────────────────────
function TechModulesOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {TECH_MODULES.map((mod, i) => {
        // Distribute around the edges
        const positions = [
          { top: "8%", left: "2%" },
          { top: "22%", left: "1%" },
          { top: "38%", left: "3%" },
          { top: "55%", left: "1%" },
          { top: "70%", left: "2%" },
          { top: "82%", left: "4%" },
          { top: "8%", right: "2%" },
          { top: "22%", right: "1%" },
          { top: "38%", right: "3%" },
          { top: "55%", right: "1%" },
          { top: "70%", right: "2%" },
          { top: "82%", right: "4%" },
        ] as React.CSSProperties[];

        return (
          <div
            key={mod.label}
            className="absolute hidden lg:flex items-center gap-2 rounded-lg border border-sky-400/20 bg-sky-950/20 px-3 py-2 backdrop-blur-sm"
            style={{
              ...positions[i],
              animation: `moduleFloat ${3.5 + (i % 4) * 0.7}s ease-in-out infinite, moduleFadeIn 0.6s ease-out both`,
              animationDelay: `${mod.delay}s, ${mod.delay}s`,
              boxShadow: "0 0 12px rgba(0,217,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <span className="text-base leading-none">{mod.icon}</span>
            <div>
              <p className="font-mono text-[8px] tracking-widest text-sky-400/80">
                {mod.label}
              </p>
              <div
                className="mt-0.5 h-0.5 rounded-full"
                style={{
                  width: `${30 + (i * 7) % 30}px`,
                  background: "linear-gradient(90deg, #4FD6FF, transparent)",
                  opacity: 0.6,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── AI Auth overlay ──────────────────────────────────────────────────────────
function AIAuthOverlay({
  active,
  success,
  onDone,
}: {
  active: boolean;
  success: boolean | null;
  onDone: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [scanPct, setScanPct] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentStep(-1);
      setScanPct(0);
      setShowResult(false);
      return;
    }
    let step = 0;
    const stepInterval = setInterval(() => {
      if (step < AUTH_STEPS.length) {
        setCurrentStep(step);
        step++;
      } else {
        clearInterval(stepInterval);
        setShowResult(true);
        setTimeout(onDone, 1200);
      }
    }, 480);
    const scanInterval = setInterval(() => {
      setScanPct((p) => {
        if (p >= 100) { clearInterval(scanInterval); return 100; }
        return p + 2.5;
      });
    }, 60);
    return () => { clearInterval(stepInterval); clearInterval(scanInterval); };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl overflow-hidden">
      {/* Scanner line */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: `${scanPct}%`,
          background: "linear-gradient(90deg, transparent, #00D9FF, #80FFFF, #00D9FF, transparent)",
          boxShadow: "0 0 16px rgba(0,217,255,0.9), 0 0 32px rgba(0,217,255,0.4)",
          transition: "top 0.06s linear",
        }}
      />
      {/* Blue tint overlay */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{ background: "rgba(0, 60, 90, 0.45)", backdropFilter: "blur(2px)" }}
      />

      <div className="relative z-10 flex flex-col items-center gap-3 px-8 text-center">
        {/* Spinning ring */}
        <div
          className="h-14 w-14 rounded-full border-2 border-sky-400/30 border-t-sky-400"
          style={{ animation: "spin 1s linear infinite" }}
        />

        <div className="space-y-1.5 mt-2">
          {AUTH_STEPS.map((step, i) => (
            <p
              key={step}
              className="font-mono text-xs transition-all duration-300"
              style={{
                color:
                  i < currentStep
                    ? "rgba(52,211,153,0.8)"
                    : i === currentStep
                      ? "#4FD6FF"
                      : "rgba(255,255,255,0.2)",
                textShadow:
                  i === currentStep ? "0 0 10px rgba(79,214,255,0.8)" : "none",
              }}
            >
              {i < currentStep ? "✓ " : i === currentStep ? "▶ " : "  "}
              {step}
            </p>
          ))}
        </div>

        {showResult && (
          <div
            className="mt-3 rounded-lg border px-6 py-2 font-mono text-sm tracking-widest"
            style={{
              borderColor: success ? "rgba(52,211,153,0.5)" : "rgba(248,113,113,0.5)",
              background: success ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
              color: success ? "#34d399" : "#f87171",
              textShadow: success
                ? "0 0 12px rgba(52,211,153,0.8)"
                : "0 0 12px rgba(248,113,113,0.8)",
              animation: "welcomeFadeIn 0.4s ease-out",
            }}
          >
            {success ? "ACCESS GRANTED" : "ACCESS DENIED"}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();

  // Phases: boot → ready
  const [phase, setPhase] = useState<"boot" | "ready">("boot");
  const [panelVisible, setPanelVisible] = useState(false);

  // Mouse for parallax
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Auth sequence
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authResult, setAuthResult] = useState<boolean | null>(null);
  const pendingActionRef = useRef<(() => Promise<void>) | null>(null);

  // UTC clock
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMouseX((e.clientX / window.innerWidth) * 2 - 1);
    setMouseY(-((e.clientY / window.innerHeight) * 2 - 1));
  }, []);

  const handleBootComplete = useCallback(() => {
    setPhase("ready");
    setTimeout(() => setPanelVisible(true), 100);
  }, []);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) return;
    setAuthError(null);
    setAuthSuccess(null);

    // Store the actual auth action, run after auth sequence
    pendingActionRef.current = async () => {
      if (isSignUp) {
        const { error, needsConfirmation } = await signUp(email.trim(), password);
        if (error) {
          setAuthResult(false);
          setAuthError(error);
        } else if (needsConfirmation) {
          setAuthResult(true);
          setAuthSuccess(
            `Account created! Check ${email.trim()} for a confirmation email, then Sign In.`,
          );
          setIsSignUp(false);
        } else {
          setAuthResult(true);
          navigate({ to: "/" });
        }
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setAuthResult(false);
          setAuthError(error);
        } else {
          setAuthResult(true);
          // Navigate happens in onAuthDone after "ACCESS GRANTED" shows
        }
      }
    };

    setIsAuthenticating(true);
  };

  const handleAuthDone = useCallback(async () => {
    if (pendingActionRef.current) {
      await pendingActionRef.current();
      pendingActionRef.current = null;
    }
    // Small delay so user sees the result
    setTimeout(() => {
      setIsAuthenticating(false);
      if (authResult === true && !isSignUp) {
        navigate({ to: "/" });
      }
    }, 800);
  }, [authResult, isSignUp, navigate]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-[#05070A]"
      onMouseMove={handleMouseMove}
    >
      {/* ── Full-screen 3D scene ── */}
      <CinematicLoginScene mouseX={mouseX} mouseY={mouseY} />

      {/* ── CSS background layers ── */}
      <div className="pointer-events-none absolute inset-0 z-[1]">
        <div className="starfield" />
        <div className="grid-overlay" />
        {/* Ambient radial glow behind Earth center */}
        <div
          className="absolute"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: "700px",
            height: "700px",
            background:
              "radial-gradient(circle, rgba(0,100,180,0.18) 0%, rgba(0,60,120,0.08) 45%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      {/* ── Tech modules overlay ── */}
      <TechModulesOverlay visible={phase === "ready"} />

      {/* ── Top bar ── */}
      {phase === "ready" && (
        <div
          className="pointer-events-auto relative z-20 flex items-center justify-between px-6 py-4"
          style={{ animation: "moduleFadeIn 0.8s ease-out" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-start gap-0.5">
            <img
              src="/opoad-logo-transparent.png"
              alt="OPCAD"
              className="h-10 w-auto object-contain"
              style={{
                filter:
                  "brightness(1.8) drop-shadow(0 0 18px rgba(0,217,255,0.9)) drop-shadow(0 0 6px rgba(255,255,255,0.6)) drop-shadow(0 0 40px rgba(0,217,255,0.5))",
                animation: "breatheLogo 4s ease-in-out infinite",
              }}
            />
            <p className="font-mono text-[9px] tracking-[0.32em] text-sky-400/80 pl-1">
              INTELLIGENCE · AUTOMATION · FUTURE
            </p>
          </div>

          {/* System status pill */}
          <div className="glass hidden md:flex items-center gap-3 rounded-full px-5 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/90">
              System · Online
            </span>
            <span className="h-4 w-px bg-primary/30" />
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              {time} UTC
            </span>
          </div>
        </div>
      )}

      {/* ── Central login panel ── */}
      {phase === "ready" && (
        <div className="pointer-events-auto relative z-20 flex flex-1 items-center justify-center px-4 py-6 min-h-[calc(100vh-160px)]">
          <div
            className="w-full max-w-md"
            style={{
              opacity: panelVisible ? 1 : 0,
              transform: panelVisible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.97)",
              transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
            }}
          >
            {/* Glass card */}
            <div
              className="relative overflow-hidden rounded-3xl p-8"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.008) 50%, rgba(0,120,200,0.03) 100%)",
                backdropFilter: "blur(14px) saturate(130%)",
                WebkitBackdropFilter: "blur(14px) saturate(130%)",
                border: "1px solid rgba(0,217,255,0.18)",
                boxShadow:
                  "0 0 60px rgba(0,217,255,0.06), 0 0 0 1px rgba(0,217,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 60px rgba(0,0,0,0.45)",
                animation: "neonBorderPulse 4s ease-in-out infinite",
              }}
            >
              {/* Internal moving particle shimmer */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden"
                style={{ zIndex: 0 }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,217,255,0.07), transparent 70%)",
                  }}
                />
                <div
                  className="absolute h-px left-0 right-0"
                  style={{
                    top: "40%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(0,217,255,0.15), transparent)",
                    animation: "scanline 8s linear infinite",
                  }}
                />
              </div>

              {/* AI Auth overlay */}
              <AIAuthOverlay
                active={isAuthenticating}
                success={authResult}
                onDone={handleAuthDone}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 mb-4">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    <span className="font-mono text-[10px] text-emerald-400 tracking-wide">
                      GLOBAL INTELLIGENCE SYSTEM · ONLINE
                    </span>
                  </div>

                  <h1
                    className="text-2xl font-semibold text-white leading-tight"
                    style={{ textShadow: "0 0 20px rgba(0,217,255,0.25)" }}
                  >
                    GLOBAL AI CORE
                  </h1>
                  <p className="mt-1.5 text-sm text-white/50 font-mono tracking-wider">
                    Connecting Humanity To The Next Civilization
                  </p>
                </div>

                {/* Cyan divider */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400/40" />
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/40"
                    style={{
                      background: "rgba(0,217,255,0.08)",
                      boxShadow: "0 0 12px rgba(0,217,255,0.3)",
                    }}
                  >
                    <Shield size={14} className="text-sky-400" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-400/40" />
                </div>

                {/* Tab toggle */}
                <div className="flex rounded-xl border border-white/10 bg-white/5 p-1 mb-5">
                  {["Sign In", "Create Account"].map((label, i) => (
                    <button
                      key={label}
                      onClick={() => {
                        setIsSignUp(i === 1);
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="flex-1 rounded-lg py-2 text-xs font-semibold font-mono tracking-wider transition-all"
                      style={{
                        background:
                          isSignUp === (i === 1)
                            ? "linear-gradient(135deg, rgba(0,217,255,0.15), rgba(79,214,255,0.08))"
                            : "transparent",
                        color: isSignUp === (i === 1) ? "#4FD6FF" : "rgba(255,255,255,0.4)",
                        boxShadow:
                          isSignUp === (i === 1)
                            ? "0 0 12px rgba(0,217,255,0.2), inset 0 1px 0 rgba(0,217,255,0.1)"
                            : "none",
                        border: isSignUp === (i === 1) ? "1px solid rgba(0,217,255,0.2)" : "none",
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Email field */}
                <div className="relative mb-3 group">
                  <Mail
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-sky-400 transition-colors"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter your email"
                    className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,217,255,0.5)";
                      e.currentTarget.style.background = "rgba(0,217,255,0.05)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(0,217,255,0.08), 0 0 16px rgba(0,217,255,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>

                {/* Password field */}
                <div className="relative mb-4 group">
                  <Lock
                    size={14}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-sky-400 transition-colors"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="Enter your password"
                    className="w-full rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-white/30 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,217,255,0.5)";
                      e.currentTarget.style.background = "rgba(0,217,255,0.05)";
                      e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(0,217,255,0.08), 0 0 16px rgba(0,217,255,0.1)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-sky-400 transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Remember / Forgot */}
                <div className="flex items-center justify-between mb-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setRemember(!remember)}
                      className="flex h-4 w-4 items-center justify-center rounded border transition-all cursor-pointer"
                      style={{
                        border: remember
                          ? "1px solid rgba(0,217,255,0.7)"
                          : "1px solid rgba(255,255,255,0.2)",
                        background: remember ? "rgba(0,217,255,0.15)" : "rgba(255,255,255,0.04)",
                        boxShadow: remember ? "0 0 8px rgba(0,217,255,0.4)" : "none",
                      }}
                    >
                      {remember && (
                        <div
                          className="h-2 w-2 rounded-sm"
                          style={{ background: "#00D9FF", boxShadow: "0 0 6px rgba(0,217,255,0.8)" }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-white/50">Remember me</span>
                  </label>
                  <button className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-mono tracking-wide">
                    Forgot Password?
                  </button>
                </div>

                {/* Feedback messages */}
                {authSuccess && (
                  <div className="mb-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-400 leading-relaxed">
                    {authSuccess}
                  </div>
                )}
                {authError && (
                  <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400 leading-relaxed">
                    {authError}
                  </div>
                )}

                {/* Sign In button */}
                <button
                  onClick={handleSubmit}
                  disabled={isAuthenticating}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold tracking-widest font-mono transition-all disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #00BFFF, #00D9FF, #4FD6FF)",
                    color: "#000a14",
                    boxShadow:
                      "0 0 30px rgba(0,217,255,0.5), 0 0 60px rgba(0,217,255,0.2), 0 4px 20px rgba(0,0,0,0.4)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 50px rgba(0,217,255,0.8), 0 0 100px rgba(0,217,255,0.35), 0 4px 24px rgba(0,0,0,0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 30px rgba(0,217,255,0.5), 0 0 60px rgba(0,217,255,0.2), 0 4px 20px rgba(0,0,0,0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Light sweep */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.25) 50%, transparent 80%)",
                      animation: "lightSweep 1.5s ease-in-out infinite",
                    }}
                  />
                  {isAuthenticating ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>

                {/* Continue as guest */}
                <button
                  onClick={() => navigate({ to: "/" })}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-mono tracking-widest transition-all"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,217,255,0.2)";
                    e.currentTarget.style.color = "rgba(0,217,255,0.7)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                  }}
                >
                  <User size={12} />
                  CONTINUE AS GUEST
                </button>

                {/* Security note */}
                <div className="mt-5 flex items-center justify-center gap-2 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <Shield size={12} className="text-white/25" />
                  <div className="text-center">
                    <p className="text-[10px] text-white/35 font-mono tracking-wider">
                      Secured by Quantum Encryption
                    </p>
                    <p className="text-[9px] text-white/20">
                      256-bit End-to-End Protection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer status bar ── */}
      {phase === "ready" && (
        <footer
          className="pointer-events-none relative z-20 border-t"
          style={{
            borderColor: "rgba(0,217,255,0.08)",
            background: "rgba(0,5,15,0.6)",
            backdropFilter: "blur(12px)",
            animation: "moduleFadeIn 1s ease-out 0.3s both",
          }}
        >
          <div className="flex flex-wrap items-center justify-center gap-6 px-6 py-3">
            {[
              { label: "OPCAD AI CORE", value: null, highlight: true },
              { label: "SYSTEM STATUS", value: "ONLINE", color: "#34d399" },
              { label: "UPTIME", value: "99.999%", color: "#4FD6FF" },
              { label: "QUANTUM NETWORK", value: "ACTIVE", color: "#4FD6FF" },
              { label: "GLOBAL INTELLIGENCE", value: "CONNECTED", color: "#4FD6FF" },
              { label: "AI CONSCIOUSNESS", value: "ONLINE", color: "#34d399" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                {item.value && (
                  <span
                    className="relative flex h-1.5 w-1.5"
                  >
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                      style={{ background: item.color }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full"
                      style={{ background: item.color }}
                    />
                  </span>
                )}
                <span
                  className="font-mono text-[9px] tracking-widest"
                  style={{
                    color: item.highlight ? "#4FD6FF" : "rgba(255,255,255,0.3)",
                    textShadow: item.highlight
                      ? "0 0 10px rgba(0,217,255,0.6)"
                      : "none",
                  }}
                >
                  {item.label}
                  {item.value && (
                    <span style={{ color: item.color ?? "#4FD6FF" }}>
                      {" "}
                      · {item.value}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </footer>
      )}

      {/* ── Boot screen (rendered last so it overlays everything) ── */}
      {phase === "boot" && <BootScreen onComplete={handleBootComplete} />}
    </div>
  );
}
