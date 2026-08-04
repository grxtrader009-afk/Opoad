import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Suspense, useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Radio,
  Clock,
  Zap,
  Search,
  Bookmark,
  BookmarkCheck,
  Globe,
  X,
  Sparkles,
  Loader,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Download,
  Video,
  Check,
} from "lucide-react";
import { getNews, type NewsCategory, type NewsRegion, type NewsItem } from "@/lib/news.functions";
import { useBookmarks } from "@/lib/bookmarks";
import {
  generateVideoIdeas,
  generateScript,
  type VideoIdea,
  type GeneratedScript,
} from "@/lib/ai.functions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const newsQuery = (category: NewsCategory, region: NewsRegion) =>
  queryOptions({
    queryKey: ["news", category, region],
    queryFn: () => getNews({ data: { category, region } }),
    staleTime: 60_000,
  });

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News Dashboard · OPOAD" },
      {
        name: "description",
        content: "Global news ingestion and top headlines command deck — OPOAD Intelligence Core.",
      },
      { property: "og:title", content: "OPOAD News Dashboard" },
      {
        property: "og:description",
        content: "Real-time headlines aggregated from global sources.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(newsQuery("top", "global")),
  component: NewsRoute,
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Signal lost</p>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">
          Return to core
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-10 text-center text-sm text-muted-foreground">Not found.</div>
  ),
});

const CATEGORIES: { key: NewsCategory; label: string }[] = [
  { key: "top", label: "Top" },
  { key: "world", label: "World" },
  { key: "business", label: "Business" },
  { key: "technology", label: "Technology" },
  { key: "politics", label: "Politics" },
  { key: "science", label: "Science" },
  { key: "sports", label: "Sports" },
  { key: "entertainment", label: "Entertainment" },
  { key: "health", label: "Health" },
];

const REGIONS: { key: NewsRegion; label: string }[] = [
  { key: "global", label: "Global" },
  { key: "us", label: "US" },
  { key: "in", label: "IN" },
  { key: "gb", label: "UK" },
];

function NewsRoute() {
  const [category, setCategory] = useState<NewsCategory>("top");
  const [region, setRegion] = useState<NewsRegion>("global");
  const [query, setQuery] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield" />
        <div className="grid-overlay" />
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.15_230/0.18),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Header savedOpen={showSaved} onToggleSaved={() => setShowSaved((s) => !s)} />
        <ControlBar
          category={category}
          onCategory={setCategory}
          region={region}
          onRegion={setRegion}
          query={query}
          onQuery={setQuery}
        />
        {showSaved ? (
          <SavedPanel onClose={() => setShowSaved(false)} onSelect={setSelectedNews} />
        ) : (
          <Suspense fallback={<FeedSkeleton />}>
            <NewsFeed
              category={category}
              region={region}
              query={query}
              onSelect={setSelectedNews}
            />
          </Suspense>
        )}
      </div>

      {selectedNews && (
        <CreatorStudioModal item={selectedNews} onClose={() => setSelectedNews(null)} />
      )}
    </div>
  );
}

function Header({ savedOpen, onToggleSaved }: { savedOpen: boolean; onToggleSaved: () => void }) {
  const { items } = useBookmarks();
  return (
    <header className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="glass flex h-11 w-11 items-center justify-center rounded-xl text-foreground/80 transition-all hover:text-primary hover:shadow-[0_0_18px_var(--color-glow)]"
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-primary/80">
            Module 01 · Intelligence Feed
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            News Dashboard
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSaved}
          className={
            "glass relative flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.25em] transition-all hover:text-primary " +
            (savedOpen
              ? "text-primary ring-1 ring-primary/60 shadow-[0_0_18px_var(--color-glow)]"
              : "text-foreground/80")
          }
        >
          <Bookmark size={12} />
          Saved
          {items.length > 0 && (
            <span className="ml-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] text-primary">
              {items.length}
            </span>
          )}
        </button>
        <div className="hidden md:flex glass items-center gap-3 rounded-full px-5 py-2.5">
          <Radio size={12} className="text-primary animate-pulse-glow" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/90">
            Global Uplink · Live
          </span>
        </div>
      </div>
    </header>
  );
}

function ControlBar({
  category,
  onCategory,
  region,
  onRegion,
  query,
  onQuery,
}: {
  category: NewsCategory;
  onCategory: (c: NewsCategory) => void;
  region: NewsRegion;
  onRegion: (r: NewsRegion) => void;
  query: string;
  onQuery: (v: string) => void;
}) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="glass flex items-center gap-2 rounded-full px-3 py-2 flex-1 min-w-[220px] max-w-md">
          <Search size={13} className="text-primary" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Filter signals by keyword…"
            className="w-full bg-transparent font-mono text-xs tracking-wide text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => onQuery("")}
              className="text-muted-foreground hover:text-primary"
              aria-label="Clear"
            >
              <X size={12} />
            </button>
          )}
        </div>
        <div className="glass flex items-center gap-1 rounded-full p-1">
          <Globe size={12} className="mx-2 text-primary" />
          {REGIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => onRegion(r.key)}
              className={
                "rounded-full px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all " +
                (r.key === region
                  ? "bg-primary/15 text-primary shadow-[0_0_12px_var(--color-glow)]"
                  : "text-foreground/70 hover:text-primary")
              }
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {CATEGORIES.map((c) => {
          const isActive = c.key === category;
          return (
            <button
              key={c.key}
              onClick={() => onCategory(c.key)}
              className={
                "glass rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.2em] font-mono transition-all " +
                (isActive
                  ? "text-primary shadow-[0_0_18px_var(--color-glow)] ring-1 ring-primary/60"
                  : "text-foreground/70 hover:text-primary")
              }
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NewsFeed({
  category,
  region,
  query,
  onSelect,
}: {
  category: NewsCategory;
  region: NewsRegion;
  query: string;
  onSelect: (item: NewsItem) => void;
}) {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(newsQuery(category, region));
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ["news", category, region] });
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.items;
    return data.items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q) ||
        (i.summary?.toLowerCase().includes(q) ?? false),
    );
  }, [data.items, query]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="space-y-6">
      <MetricsRow
        count={filtered.length}
        total={data.count}
        fetchedAt={data.fetchedAt}
        onRefresh={refresh}
        refreshing={refreshing}
        filtered={!!query.trim()}
      />

      {featured && <FeaturedCard item={featured} onSelect={onSelect} />}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {rest.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} onSelect={onSelect} />
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {query ? "No signals match this query" : "No signals detected on this channel"}
          </p>
        </div>
      )}
    </div>
  );
}

function SavedPanel({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (item: NewsItem) => void;
}) {
  const { items, clear } = useBookmarks();
  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
        <div className="flex items-center gap-3">
          <BookmarkCheck size={14} className="text-primary" />
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/90">
            Archive · {items.length} dispatch{items.length === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              onClick={clear}
              className="glass rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70 hover:text-red-400"
            >
              Purge All
            </button>
          )}
          <button
            onClick={onClose}
            className="glass rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/70 hover:text-primary"
          >
            Close
          </button>
        </div>
      </div>
      {items.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Archive empty — save dispatches from the feed
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <NewsCard key={item.id} item={item} index={i} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

function MetricsRow({
  count,
  total,
  fetchedAt,
  onRefresh,
  refreshing,
  filtered,
}: {
  count: number;
  total: number;
  fetchedAt: string;
  onRefresh: () => void;
  refreshing: boolean;
  filtered: boolean;
}) {
  const time = useMemo(
    () =>
      new Date(fetchedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    [fetchedAt],
  );
  return (
    <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-6">
        <Metric
          icon={<Zap size={12} />}
          label="Signals"
          value={filtered ? `${count} / ${total}` : String(total)}
        />
        <Metric icon={<Clock size={12} />} label="Synced" value={time} />
        <Metric icon={<Radio size={12} />} label="Source" value="Google News · Uplink" />
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="glass group flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-mono uppercase tracking-[0.25em] text-foreground/80 transition-all hover:text-primary hover:shadow-[0_0_18px_var(--color-glow)] disabled:opacity-50"
      >
        <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
        {refreshing ? "Syncing" : "Resync"}
      </button>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-primary">{icon}</span>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </p>
        <p className="font-mono text-xs text-foreground">{value}</p>
      </div>
    </div>
  );
}

function relTime(iso: string) {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function SaveButton({ item, className }: { item: NewsItem; className?: string }) {
  const { isSaved, toggle } = useBookmarks();
  const saved = isSaved(item.id);
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      aria-label={saved ? "Remove bookmark" : "Save dispatch"}
      className={
        "glass flex h-8 w-8 items-center justify-center rounded-full transition-all hover:text-primary hover:shadow-[0_0_14px_var(--color-glow)] " +
        (saved ? "text-primary ring-1 ring-primary/60" : "text-foreground/70 ") +
        (className ?? "")
      }
    >
      {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
    </button>
  );
}

function FeaturedCard({ item, onSelect }: { item: NewsItem; onSelect: (item: NewsItem) => void }) {
  return (
    <motion.div
      onClick={() => onSelect(item)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong group relative block overflow-hidden rounded-3xl p-6 md:p-8 cursor-pointer hover:shadow-[0_0_35px_oklch(0.82_0.15_230/0.25)] hover:ring-1 hover:ring-primary/40"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.82_0.15_230/0.15),transparent_60%)]" />
      <div className="absolute right-5 top-5">
        <SaveButton item={item} />
      </div>
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-primary ring-1 ring-primary/40">
            Priority · 01
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {item.source} • {relTime(item.publishedAt)}
          </span>
        </div>
        <h2 className="text-xl font-semibold leading-snug tracking-tight text-foreground md:text-3xl">
          {item.title}
        </h2>
        {item.summary && (
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-primary/90 opacity-80 transition-opacity group-hover:opacity-100">
          Analyze & Craft Video <Sparkles size={12} className="text-primary animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}

function NewsCard({
  item,
  index,
  onSelect,
}: {
  item: NewsItem;
  index: number;
  onSelect: (item: NewsItem) => void;
}) {
  return (
    <motion.div
      onClick={() => onSelect(item)}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.4) }}
      className="glass group relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl p-5 cursor-pointer transition-all hover:shadow-[0_0_24px_oklch(0.82_0.15_230/0.25)] hover:ring-1 hover:ring-primary/40"
    >
      <div className="absolute right-3 top-3">
        <SaveButton item={item} />
      </div>
      <div className="flex items-center justify-between pr-10">
        <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-primary/80">
          {item.source}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          {relTime(item.publishedAt)}
        </span>
      </div>
      <h3 className="text-sm font-semibold leading-snug text-foreground md:text-base">
        {item.title}
      </h3>
      {item.summary && (
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{item.summary}</p>
      )}
      <div className="mt-auto flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Analyze & Craft Video <Sparkles size={11} className="text-primary" />
      </div>
    </motion.div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      <div className="glass h-24 rounded-2xl animate-pulse" />
      <div className="glass-strong h-48 rounded-3xl animate-pulse" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass h-40 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Interactive Creator Studio Dialog Component
function CreatorStudioModal({ item, onClose }: { item: NewsItem; onClose: () => void }) {
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"concepts" | "teleprompter">(
    "concepts",
  );
  const [language, setLanguage] = useState<string>("English");
  const [tone, setTone] = useState<string>("Serious");

  // AI Generation States
  const [ideas, setIdeas] = useState<VideoIdea[] | null>(null);
  const [loadingIdeas, setLoadingIdeas] = useState<boolean>(false);
  const [loadingIdeasStep, setLoadingIdeasStep] = useState<string>("");

  const [selectedIdea, setSelectedIdea] = useState<VideoIdea | null>(null);
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [loadingScript, setLoadingScript] = useState<boolean>(false);
  const [loadingScriptStep, setLoadingScriptStep] = useState<string>("");
  const [editedScriptText, setEditedScriptText] = useState<string>("");

  // Teleprompter Scrolling States
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(3);
  const [fontSize, setFontSize] = useState<number>(24);

  // Web Camera Recording States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(0);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Setup/Tear down camera preview when transitioning to Teleprompter Mode
  useEffect(() => {
    if (activeWorkspaceTab === "teleprompter") {
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 }, audio: true })
        .then((stream) => {
          setWebcamStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera access failed, falling back to silent video only:", err);
          // Try without audio to bypass permission errors
          navigator.mediaDevices
            .getUserMedia({ video: true })
            .then((stream) => {
              setWebcamStream(stream);
              if (videoRef.current) {
                videoRef.current.srcObject = stream;
              }
            })
            .catch((e) => console.error("Webcam access denied completely:", e));
        });
    } else {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
        setWebcamStream(null);
      }
      setIsScrolling(false);
      setIsRecording(false);
    }

    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeWorkspaceTab]);

  // Smooth Teleprompter auto-scrolling animation frame loop
  useEffect(() => {
    if (!isScrolling) return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const scroll = (time: number) => {
      const elapsed = time - lastTime;
      lastTime = time;

      if (scrollContainerRef.current) {
        // scrollSpeed scale from 1 (very slow) to 10 (fast)
        scrollContainerRef.current.scrollTop += scrollSpeed * elapsed * 0.012;
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isScrolling, scrollSpeed]);

  // Recording countdown handler
  useEffect(() => {
    if (countdown <= 0) {
      if (countdown === 0 && webcamStream && !isRecording) {
        // Initialize MediaRecorder
        setRecordedChunks([]);
        setRecordedVideoUrl(null);
        let rec: MediaRecorder;
        const options = { mimeType: "video/webm;codecs=vp9,opus" };
        try {
          rec = new MediaRecorder(webcamStream, options);
        } catch {
          rec = new MediaRecorder(webcamStream);
        }

        const chunks: Blob[] = [];
        rec.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        rec.onstop = () => {
          const blob = new Blob(chunks, { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          setRecordedVideoUrl(url);
        };

        rec.start(1000);
        setMediaRecorder(rec);
        setIsRecording(true);
        setRecordingTime(0);
        setIsScrolling(true); // Automatically initiate teleprompter scrolling!
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, webcamStream]);

  // Recording timer tick handler
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Format dynamic countdown timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Generate 5 custom creator angles / video ideas
  const handleGenerateConcepts = async () => {
    setLoadingIdeas(true);
    setIdeas(null);
    setSelectedIdea(null);
    setScript(null);

    // Simulated high-tech generation steps for polished OPOAD feeling
    const steps = [
      "Connecting to Google News uplink...",
      "Extracting geographic and category entities...",
      "Matching global trends & search velocity...",
      "Formulating viral creator hooks & angles...",
    ];

    let currentStepIndex = 0;
    setLoadingIdeasStep(steps[0]);

    const stepTimer = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setLoadingIdeasStep(steps[currentStepIndex]);
      }
    }, 850);

    try {
      const response = await generateVideoIdeas({
        title: item.title,
        summary: item.summary,
        source: item.source,
        language,
        tone,
      });

      clearInterval(stepTimer);
      setIdeas(response.ideas || []);
    } catch (err) {
      clearInterval(stepTimer);
      console.error(err);
    } finally {
      setLoadingIdeas(false);
    }
  };

  // Generate full, structured script for a chosen idea/angle
  const handleGenerateScript = async (idea: VideoIdea) => {
    setSelectedIdea(idea);
    setLoadingScript(true);
    setScript(null);

    const steps = [
      "Analyzing creative angle context...",
      "Injecting high-impact hook trigger...",
      "Formulating 3-part structured body points...",
      "Structuring professional transition notes...",
      "Assembling full-fluid teleprompter script...",
    ];

    let currentStepIndex = 0;
    setLoadingScriptStep(steps[0]);

    const stepTimer = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < steps.length) {
        setLoadingScriptStep(steps[currentStepIndex]);
      }
    }, 900);

    try {
      const response = await generateScript({
        title: item.title,
        summary: item.summary,
        videoTitle: idea.title,
        angle: idea.angle,
        language,
        tone,
      });

      clearInterval(stepTimer);
      if (response.script) {
        setScript(response.script);
        setEditedScriptText(response.script.fullText);
        // Switch view automatically to teleprompter workspace!
        setActiveWorkspaceTab("teleprompter");
      }
    } catch (err) {
      clearInterval(stepTimer);
      console.error(err);
    } finally {
      setLoadingScript(false);
    }
  };

  // Recording controls
  const handleStartRecording = () => {
    if (countdown > 0 || isRecording) return;
    setCountdown(3);
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setIsScrolling(false);
  };

  return (
    <Dialog open={true} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-4xl border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_45%),rgba(2,6,23,0.97)] p-0 shadow-[0_0_80px_-20px_var(--color-glow)] sm:rounded-[28px] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Block */}
        <div className="relative border-b border-primary/15 bg-primary/5 p-5 md:p-6 shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-background/50 text-primary animate-pulse-glow">
                <Sparkles size={20} strokeWidth={1.4} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-primary/70">
                    {item.source}
                  </p>
                  <span className="h-1 w-1 rounded-full bg-primary/35" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground">
                    {relTime(item.publishedAt)}
                  </p>
                </div>
                <DialogTitle className="text-lg md:text-xl font-bold tracking-tight text-foreground line-clamp-1">
                  {item.title}
                </DialogTitle>
              </div>
            </div>
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="glass hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[9px] uppercase tracking-[0.25em] text-foreground/80 hover:text-primary"
            >
              Original <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-primary/10 bg-background/20 px-6 py-2 gap-3 shrink-0">
          <button
            onClick={() => setActiveWorkspaceTab("concepts")}
            className={
              "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all " +
              (activeWorkspaceTab === "concepts"
                ? "bg-primary/15 text-primary shadow-[0_0_12px_var(--color-glow)] border border-primary/30"
                : "text-foreground/70 hover:text-primary border border-transparent")
            }
          >
            01 · Content Concepts
          </button>
          <button
            disabled={!script}
            onClick={() => setActiveWorkspaceTab("teleprompter")}
            className={
              "rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] transition-all disabled:opacity-40 " +
              (activeWorkspaceTab === "teleprompter"
                ? "bg-primary/15 text-primary shadow-[0_0_12px_var(--color-glow)] border border-primary/30"
                : "text-foreground/70 hover:text-primary border border-transparent")
            }
          >
            02 · Teleprompter & Camera
          </button>
        </div>

        {/* Modal Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {activeWorkspaceTab === "concepts" ? (
            <div className="space-y-6">
              {/* Configuration panel */}
              <div className="glass rounded-2xl border border-primary/15 bg-background/30 p-4 space-y-4">
                <div className="flex flex-col gap-1">
                  <h4 className="text-sm font-semibold text-foreground font-mono">
                    AI Concept Deck Settings
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Customize your generated script language and production tone before generating.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                      Language
                    </label>
                    <div className="flex gap-2">
                      {["English", "Hindi", "Hinglish"].map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setLanguage(lang)}
                          className={
                            "flex-1 py-2 rounded-xl text-xs font-mono tracking-wide transition-all border " +
                            (language === lang
                              ? "bg-primary/10 border-primary/45 text-primary"
                              : "bg-background/40 border-primary/10 text-muted-foreground hover:border-primary/20 hover:text-foreground")
                          }
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
                      Production Tone
                    </label>
                    <div className="flex gap-2">
                      {["Serious", "Fun", "Motivational"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTone(t)}
                          className={
                            "flex-1 py-2 rounded-xl text-xs font-mono tracking-wide transition-all border " +
                            (tone === t
                              ? "bg-primary/10 border-primary/45 text-primary"
                              : "bg-background/40 border-primary/10 text-muted-foreground hover:border-primary/20 hover:text-foreground")
                          }
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  disabled={loadingIdeas}
                  onClick={handleGenerateConcepts}
                  className="w-full relative flex items-center justify-center gap-2 bg-primary/95 text-primary-foreground font-mono text-[11px] uppercase tracking-[0.25em] py-3 rounded-xl transition hover:bg-primary shadow-[0_0_24px_rgba(34,211,238,0.2)] disabled:opacity-50"
                >
                  {loadingIdeas ? (
                    <>
                      <Loader size={14} className="animate-spin text-primary-foreground" />
                      {loadingIdeasStep}
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      Generate 5 Creator Concepts
                    </>
                  )}
                </button>
              </div>

              {/* Ideas Results */}
              {loadingIdeas && (
                <div className="glass rounded-2xl p-12 text-center border border-primary/10 flex flex-col items-center justify-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full border border-primary/30 border-t-primary animate-spin" />
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                    Orchestrating ideas...
                  </p>
                  <p className="text-xs text-muted-foreground">{loadingIdeasStep}</p>
                </div>
              )}

              {ideas && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/80">
                      Generated Concepts (5 Channels)
                    </p>
                    <span className="font-mono text-[9px] uppercase text-muted-foreground">
                      Powered by Gemini 1.5 Flash
                    </span>
                  </div>

                  <div className="grid gap-4">
                    {ideas.map((idea, index) => (
                      <div
                        key={index}
                        className="glass relative overflow-hidden rounded-2xl p-4 border border-primary/10 bg-background/20 hover:border-primary/30 transition group flex flex-col md:flex-row justify-between gap-4"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-primary">
                              Angle {index + 1}
                            </span>
                          </div>
                          <h5 className="font-bold font-sans text-base text-foreground">
                            {idea.title}
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong className="font-mono text-primary text-[10px] uppercase tracking-wider block mb-0.5">
                              Creator Hook:
                            </strong>
                            "{idea.hook}"
                          </p>
                          <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                            <strong className="font-mono text-[10px] uppercase tracking-wider block mb-0.5">
                              Production Strategy:
                            </strong>
                            {idea.angle}
                          </p>
                        </div>

                        <div className="flex items-center shrink-0">
                          <button
                            disabled={loadingScript && selectedIdea?.title === idea.title}
                            onClick={() => handleGenerateScript(idea)}
                            className="w-full md:w-auto px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl font-mono text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] transition disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loadingScript && selectedIdea?.title === idea.title ? (
                              <>
                                <Loader size={11} className="animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <Sparkles size={11} />
                                Craft Script
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loader during script writing */}
              {loadingScript && (
                <div className="glass rounded-2xl p-12 text-center border border-primary/10 flex flex-col items-center justify-center gap-4">
                  <Loader size={28} className="animate-spin text-primary" />
                  <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">
                    Drafting Teleprompter Script...
                  </p>
                  <p className="text-xs text-muted-foreground">{loadingScriptStep}</p>
                </div>
              )}
            </div>
          ) : (
            /* Teleprompter & Recording workspace */
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] h-[55vh]">
              {/* Teleprompter Script Container / Display */}
              <div className="flex flex-col h-full rounded-2xl border border-primary/15 bg-slate-950/70 overflow-hidden relative">
                {/* Scroll Indicator guides */}
                <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 pointer-events-none border-y border-cyan-500/30 bg-cyan-500/5 z-10" />

                {/* Teleprompter Screen */}
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-y-auto px-6 py-32 space-y-4 scroll-smooth"
                  style={{
                    fontSize: `${fontSize}px`,
                    lineHeight: "1.6",
                  }}
                >
                  <div className="text-center font-display font-bold uppercase text-white/90 select-none pb-40">
                    {editedScriptText ? (
                      editedScriptText.split("\n\n").map((para, i) => (
                        <p key={i} className="mb-8">
                          {para}
                        </p>
                      ))
                    ) : (
                      <p className="text-muted-foreground/60 font-mono text-sm uppercase tracking-widest">
                        Script empty or processing
                      </p>
                    )}
                  </div>
                </div>

                {/* Local Script Editor toggle drawer */}
                <div className="border-t border-primary/10 bg-background/90 p-3 shrink-0">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-primary outline-none">
                      <span>Manual Script Editor</span>
                      <Sliders size={10} className="transition group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editedScriptText}
                        onChange={(e) => setEditedScriptText(e.target.value)}
                        className="w-full h-24 rounded-lg bg-background border border-primary/10 p-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/35 resize-none"
                        placeholder="Modify generated script here..."
                      />
                    </div>
                  </details>
                </div>

                {/* Teleprompter Settings and Scroll Playbar */}
                <div className="border-t border-primary/15 bg-background/50 p-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsScrolling(!isScrolling)}
                      className={
                        "p-2 rounded-full border transition-all " +
                        (isScrolling
                          ? "bg-red-500/10 border-red-500/35 text-red-400"
                          : "bg-primary/10 border-primary/30 text-primary")
                      }
                    >
                      {isScrolling ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setIsScrolling(false);
                        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
                      }}
                      className="p-2 rounded-full border border-primary/10 bg-background/40 text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  {/* speed & font sliders */}
                  <div className="flex items-center gap-4 flex-1 max-w-[240px]">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[8px] uppercase font-mono text-muted-foreground mb-1">
                        <span>Speed</span>
                        <span>{scrollSpeed}x</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        step="0.5"
                        value={scrollSpeed}
                        onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                        className="w-full accent-primary h-1 rounded bg-primary/20 appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between text-[8px] uppercase font-mono text-muted-foreground mb-1">
                        <span>Font Size</span>
                        <span>{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        step="2"
                        value={fontSize}
                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                        className="w-full accent-primary h-1 rounded bg-primary/20 appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Camera Capture and Recording Controls */}
              <div className="flex flex-col h-full rounded-2xl border border-primary/15 bg-slate-950/70 overflow-hidden relative">
                <div className="flex-1 relative bg-background/40 flex items-center justify-center">
                  {/* Countdown overlay */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center z-20">
                      <p className="text-sm font-mono text-primary animate-pulse uppercase tracking-[0.3em]">
                        Preparing Capture
                      </p>
                      <p className="text-6xl font-display font-extrabold text-white mt-2">
                        {countdown}
                      </p>
                    </div>
                  )}

                  {/* Live video output */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover rounded-t-2xl scale-x-[-1]"
                  />

                  {/* Status Overlay indicators */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                    {isRecording ? (
                      <div className="flex items-center gap-1.5 rounded-full bg-red-500/20 border border-red-500/50 px-2.5 py-1 text-[9px] uppercase tracking-widest text-red-400 font-mono animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        REC {formatTime(recordingTime)}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-full bg-background/70 border border-primary/20 px-2.5 py-1 text-[9px] uppercase tracking-widest text-primary font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        Capture Standby
                      </div>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 text-[9px] font-mono tracking-wider text-white/50 bg-slate-950/40 px-2 py-0.5 rounded border border-white/5 pointer-events-none">
                    1080p • 30fps
                  </div>
                </div>

                {/* Playback download layer if recorded video available */}
                {recordedVideoUrl && (
                  <div className="p-3 shrink-0 bg-primary/5 border-t border-primary/10 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-wider text-primary">
                        Take Recorded Successfully
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Ready for review or download.
                      </span>
                    </div>

                    <a
                      href={recordedVideoUrl}
                      download={`OPOAD-take-${item.id}.webm`}
                      className="flex items-center gap-1.5 bg-primary/15 border border-primary/40 px-3 py-1.5 rounded-lg text-primary text-[10px] font-mono uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                    >
                      <Download size={12} />
                      Download
                    </a>
                  </div>
                )}

                {/* Capture and recording trigger */}
                <div className="p-4 bg-background/80 shrink-0 border-t border-primary/10 flex items-center justify-center gap-4">
                  {isRecording ? (
                    <button
                      onClick={handleStopRecording}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/25 border border-red-500 text-red-400 hover:bg-red-500 hover:text-white font-mono text-[10px] uppercase tracking-[0.25em] py-3 rounded-xl transition"
                    >
                      <X size={14} />
                      Stop Recording Take
                    </button>
                  ) : (
                    <button
                      onClick={handleStartRecording}
                      disabled={countdown > 0}
                      className="w-full flex items-center justify-center gap-2 bg-primary/95 text-primary-foreground font-mono text-[10px] uppercase tracking-[0.25em] py-3 rounded-xl transition hover:bg-primary shadow-[0_0_15px_rgba(34,211,238,0.2)] disabled:opacity-50"
                    >
                      <Video size={14} />
                      {countdown > 0 ? "Starting take..." : "Record Video Take"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
