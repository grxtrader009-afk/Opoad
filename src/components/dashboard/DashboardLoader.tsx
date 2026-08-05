import { useEffect, useState, useRef } from "react";

const STAGES = [
  "Initializing AI System...",
  "Loading Dashboard...",
  "Connecting Global Network...",
  "Preparing AI Assistant...",
];

/**
 * Premium full-screen glassmorphism loading overlay.
 * Shows brand name, a CSS holographic globe, progress bar, and cycling status lines.
 * Calls `onComplete` after reaching 100% so the parent can fade it out.
 */
export function DashboardLoader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      // Ease toward 95% over ~2.6s, then hold until onComplete fires from parent
      const target = Math.min(95, (elapsed / 2600) * 95);
      setProgress((prev) => prev + (target - prev) * 0.08);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
    }, 700);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const t = window.setTimeout(onComplete, 350);
      return () => window.clearTimeout(t);
    }
  }, [progress, onComplete]);

  // Expose a way for parent to push to 100% — via a custom event
  useEffect(() => {
    const handler = () => setProgress(100);
    window.addEventListener("opoad-dashboard-ready", handler);
    return () => window.removeEventListener("opoad-dashboard-ready", handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at center, #060d1a 0%, #030611 60%, #01030a 100%)",
      }}
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,180,255,0.12),transparent_65%)] blur-2xl" />

      {/* Starfield dots */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        {Array.from({ length: 80 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${1 + (i % 3) * 0.5}px`,
              height: `${1 + (i % 3) * 0.5}px`,
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              opacity: 0.2 + ((i % 5) * 0.15),
              animation: `twinkle ${2 + (i % 4)}s ease-in-out ${i * 0.05}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center gap-8 px-6">
        {/* Holographic CSS globe */}
        <div className="relative h-32 w-32">
          {/* Orbit rings */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/20"
            style={{ transform: "rotateX(72deg)", animation: "spin 6s linear infinite" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/15"
            style={{ transform: "rotateX(72deg) rotateZ(60deg)", animation: "spin 8s linear infinite reverse" }}
          />
          <div
            className="absolute inset-0 rounded-full border border-cyan-400/10"
            style={{ transform: "rotateY(72deg)", animation: "spin 10s linear infinite" }}
          />
          {/* Globe sphere */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, #0ea5e9 0%, #0369a1 30%, #0c1e3a 60%, #050b18 100%)",
              boxShadow:
                "inset -10px -10px 30px rgba(0,0,0,0.6), inset 8px 8px 20px rgba(56,189,248,0.15), 0 0 40px rgba(0,180,255,0.2)",
            }}
          >
            {/* Meridian lines via repeating gradient overlay */}
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background:
                  "repeating-linear-gradient(90deg, transparent 0px, transparent 7px, rgba(56,189,248,0.4) 7px, rgba(56,189,248,0.4) 8px)",
                animation: "globe-rotate 4s linear infinite",
                maskImage: "radial-gradient(circle, black 55%, transparent 56%)",
                WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 56%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-full opacity-20"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent 0px, transparent 9px, rgba(56,189,248,0.3) 9px, rgba(56,189,248,0.3) 10px)",
                maskImage: "radial-gradient(circle, black 55%, transparent 56%)",
                WebkitMaskImage: "radial-gradient(circle, black 55%, transparent 56%)",
              }}
            />
          </div>
          {/* Atmosphere rim */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: "0 0 25px 4px rgba(56,189,248,0.15), inset 0 0 20px rgba(56,189,248,0.08)",
              animation: "atmo-pulse 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1
            className="text-3xl font-light tracking-[0.3em] text-white"
            style={{ textShadow: "0 0 20px rgba(56,189,248,0.4)" }}
          >
            OPOAD
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em] text-cyan-400/70">
            AI Operating System
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 max-w-[80vw]">
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full transition-all duration-200 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  "linear-gradient(90deg, #0ea5e9, #38bdf8, #67e8f9)",
                boxShadow: "0 0 10px rgba(56,189,248,0.5)",
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-widest text-cyan-400/60">
            <span>{STAGES[stageIndex]}</span>
            <span className="tabular-nums">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Stage checklist */}
        <div className="flex flex-col gap-1.5">
          {STAGES.map((s, i) => (
            <div
              key={s}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition-opacity duration-300"
              style={{ opacity: i <= stageIndex ? 0.8 : 0.25 }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: i < stageIndex ? "#34d399" : i === stageIndex ? "#38bdf8" : "#334155",
                  boxShadow:
                    i < stageIndex
                      ? "0 0 6px rgba(52,211,153,0.6)"
                      : i === stageIndex
                        ? "0 0 6px rgba(56,189,248,0.6)"
                        : "none",
                  animation: i === stageIndex ? "pulse-dot 1s ease-in-out infinite" : undefined,
                }}
              />
              <span className={i < stageIndex ? "text-emerald-400/70" : i === stageIndex ? "text-cyan-300" : "text-slate-500"}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
