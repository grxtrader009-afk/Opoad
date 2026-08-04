import { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe as Globe2, TrendingUp, TrendingDown, Activity, Zap, TriangleAlert as AlertTriangle, Flame, Clock, ExternalLink, Sparkles, Loader as Loader2, X, Brain, FileText, Video, Film, ChevronRight, RefreshCw, Newspaper, DollarSign, Cpu, Rocket } from "lucide-react";
import { getNews, type NewsItem } from "@/lib/news.functions";
import { analyzeNews, type NewsAnalysis } from "@/lib/ai.functions";
import { fetchNewsImage } from "@/lib/news-image.functions";

const MiniEarth = lazy(() =>
  import("@/components/dashboard/MiniEarth").then((m) => ({ default: m.MiniEarth })),
);

/* ─── Category config ─── */
const CATEGORY_TABS = [
  { key: "top", label: "All", icon: Globe2 },
  { key: "business", label: "Business", icon: DollarSign },
  { key: "technology", label: "Tech", icon: Cpu },
  { key: "science", label: "Science", icon: Rocket },
  { key: "entertainment", label: "Markets", icon: TrendingUp },
] as const;

type TabKey = (typeof CATEGORY_TABS)[number]["key"];

/* ─── Sentiment helpers ─── */
function inferSentiment(title: string): "positive" | "negative" | "neutral" {
  const positive = /\b(surge|rally|gain|profit|growth|boost|win|deal|launch|breakthrough|record|high|up|rise|soar)\b/i;
  const negative = /\b(crash|fall|loss|drop|decline|bankrupt|fraud|scam|hack|breach|lawsuit|down|plunge|fear|crisis|warn)\b/i;
  if (positive.test(title) && !negative.test(title)) return "positive";
  if (negative.test(title) && !positive.test(title)) return "negative";
  return "neutral";
}

function inferRanking(title: string, idx: number): "breaking" | "high" | "trending" {
  if (/\b(breaking|urgent|alert|just in|live)\b/i.test(title)) return "breaking";
  if (idx < 2) return "high";
  return "trending";
}

function inferMarketImpact(title: string, sentiment: string): number {
  let score = 5;
  if (sentiment === "positive") score += 2;
  if (sentiment === "negative") score += 1;
  if (/\b(stock|market|fed|rate|inflation|gdp|crypto|bitcoin|oil|gold)\b/i.test(title)) score += 2;
  if (/\b(ai|chip|semiconductor|tech|startup|ipo)\b/i.test(title)) score += 1;
  return Math.min(score, 10);
}

/* ─── Relative time ─── */
function relTime(iso: string): string {
  const diff = Date.now() - +new Date(iso);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/* ═══════════════════════════════════════════════════════════════ */
/* MAIN PANEL                                                       */
/* ═══════════════════════════════════════════════════════════════ */

export function GlobalNetworkPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("top");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [livePulse, setLivePulse] = useState(0);

  /* Fetch news */
  const loadNews = useCallback(async (tab: TabKey, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await getNews({ data: { category: tab, region: "global" } });
      setNewsItems(res.items);
    } catch {
      setNewsItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNews(activeTab);
  }, [activeTab, loadNews]);

  /* Live pulse indicator */
  useEffect(() => {
    const id = setInterval(() => setLivePulse((p) => p + 1), 3000);
    return () => clearInterval(id);
  }, []);

  /* Fetch images for top news items */
  useEffect(() => {
    if (!newsItems.length) return;
    const top = newsItems.slice(0, 6);
    let cancelled = false;
    top.forEach(async (item) => {
      if (images[item.id]) return;
      const res = await fetchNewsImage({ data: { title: item.title } });
      if (!cancelled && res.imageUrl) {
        setImages((prev) => ({ ...prev, [item.id]: res.imageUrl! }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [newsItems, images]);

  const enrichedNews = newsItems.map((item, idx) => {
    const sentiment = inferSentiment(item.title);
    return {
      ...item,
      sentiment,
      ranking: inferRanking(item.title, idx),
      marketImpact: inferMarketImpact(item.title, sentiment),
      image: images[item.id] ?? null,
    };
  });

  return (
    <div className="space-y-4">
      {/* ── 3D Transparent Header with Mini Earth ── */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/15 bg-gradient-to-br from-slate-950/60 via-blue-950/30 to-slate-950/60 backdrop-blur-xl">
        {/* Mini rotating earth */}
        <div className="absolute right-0 top-0 h-full w-32 opacity-60 pointer-events-none">
          <Suspense fallback={null}>
            <MiniEarth />
          </Suspense>
        </div>

        {/* Moving data particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${10 + i * 11}%`,
                top: `${20 + (i % 3) * 25}%`,
                width: 2,
                height: 2,
                background: "rgba(56,189,248,0.6)",
                animation: `gnetFloat ${2.5 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10">
              <Globe2 size={14} className="text-cyan-400" />
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-cyan-400/70">
                Global Intelligence
              </p>
              <h3 className="text-sm font-semibold text-white">Global Network</h3>
            </div>
          </div>

          {/* Live indicators */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-emerald-400">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity size={10} className="text-cyan-400 animate-pulse" />
              <span className="font-mono text-[9px] text-cyan-300/70">
                {enrichedNews.length} signals
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={10} className="text-amber-400 animate-pulse" />
              <span className="font-mono text-[9px] text-amber-300/70">
                Pulse {livePulse}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Tabs ── */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all ${
                isActive
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,217,255,0.15)]"
                  : "bg-slate-950/40 text-slate-400 border border-slate-800 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              <Icon size={11} />
              {tab.label}
            </button>
          );
        })}
        <button
          onClick={() => loadNews(activeTab, true)}
          disabled={refreshing}
          className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/30 transition disabled:opacity-50"
        >
          <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Sync" : "Refresh"}
        </button>
      </div>

      {/* ── News Feed ── */}
      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 gnet-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-8 w-8 rounded-full border border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-400/60">
              Scanning global signals...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {enrichedNews.map((item, idx) => (
              <NewsCard
                key={item.id}
                item={item}
                index={idx}
                onSelect={() => setSelectedItem(item)}
              />
            ))}
          </AnimatePresence>
        )}
        {!loading && enrichedNews.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Newspaper size={24} className="text-slate-600" />
            <p className="mt-2 font-mono text-[10px] uppercase tracking-widest text-slate-500">
              No signals on this channel
            </p>
          </div>
        )}
      </div>

      {/* ── AI Analysis Modal ── */}
      <AnimatePresence>
        {selectedItem && (
          <AiAnalysisModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        @keyframes gnetFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          50% { transform: translate(8px, -10px) scale(1.5); opacity: 0.8; }
        }
        .gnet-scroll::-webkit-scrollbar { width: 4px; }
        .gnet-scroll::-webkit-scrollbar-track { background: transparent; }
        .gnet-scroll::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* NEWS CARD                                                        */
/* ═══════════════════════════════════════════════════════════════ */

interface EnrichedNews extends NewsItem {
  sentiment: "positive" | "negative" | "neutral";
  ranking: "breaking" | "high" | "trending";
  marketImpact: number;
  image: string | null;
}

function NewsCard({
  item,
  index,
  onSelect,
}: {
  item: EnrichedNews;
  index: number;
  onSelect: () => void;
}) {
  const rankingConfig = {
    breaking: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30", label: "BREAKING" },
    high: { icon: Flame, color: "text-amber-400", bg: "bg-amber-500/15", border: "border-amber-500/30", label: "HIGH IMPACT" },
    trending: { icon: TrendingUp, color: "text-cyan-400", bg: "bg-cyan-500/15", border: "border-cyan-500/30", label: "TRENDING" },
  };
  const rank = rankingConfig[item.ranking];
  const RankIcon = rank.icon;

  const sentimentConfig = {
    positive: { icon: TrendingUp, color: "text-emerald-400", label: "Positive" },
    negative: { icon: TrendingDown, color: "text-red-400", label: "Negative" },
    neutral: { icon: Activity, color: "text-slate-400", label: "Neutral" },
  };
  const sent = sentimentConfig[item.sentiment];
  const SentIcon = sent.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      onClick={onSelect}
      className="group relative overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/40 backdrop-blur-sm p-3 cursor-pointer transition-all hover:border-cyan-500/30 hover:bg-slate-900/50 hover:shadow-[0_0_20px_rgba(0,217,255,0.08)]"
    >
      {/* Image thumbnail */}
      {item.image && (
        <div className="absolute right-0 top-0 h-full w-20 opacity-30 overflow-hidden pointer-events-none group-hover:opacity-50 transition-opacity">
          <img
            src={item.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-slate-950" />
        </div>
      )}

      <div className="relative z-10 pr-20">
        {/* Top row: ranking + source + time */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`flex items-center gap-1 rounded-full ${rank.bg} ${rank.border} border px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider ${rank.color}`}>
            <RankIcon size={8} />
            {rank.label}
          </span>
          <span className="font-mono text-[9px] text-slate-500 truncate">{item.source}</span>
          <span className="font-mono text-[9px] text-slate-600 flex items-center gap-0.5 ml-auto">
            <Clock size={8} />
            {relTime(item.publishedAt)}
          </span>
        </div>

        {/* Headline */}
        <h4 className="text-xs font-medium text-slate-100 leading-snug line-clamp-2 group-hover:text-cyan-200 transition-colors">
          {item.title}
        </h4>

        {/* Summary */}
        {item.summary && (
          <p className="mt-1 text-[10px] text-slate-400 leading-relaxed line-clamp-2">
            {item.summary}
          </p>
        )}

        {/* Bottom row: sentiment + market impact + category */}
        <div className="mt-2 flex items-center gap-3">
          <span className={`flex items-center gap-1 text-[9px] font-mono ${sent.color}`}>
            <SentIcon size={9} />
            {sent.label}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-mono text-slate-400">
            <Zap size={8} className="text-amber-400" />
            Impact {item.marketImpact}/10
          </span>
          <span className="ml-auto flex items-center gap-0.5 text-[9px] font-mono text-cyan-400/60 opacity-0 group-hover:opacity-100 transition">
            <Sparkles size={9} />
            Analyze
            <ChevronRight size={9} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* AI ANALYSIS MODAL                                                */
/* ═══════════════════════════════════════════════════════════════ */

function AiAnalysisModal({
  item,
  onClose,
}: {
  item: NewsItem;
  onClose: () => void;
}) {
  const [analysis, setAnalysis] = useState<NewsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<
    "report" | "youtube" | "reel"
  >("report");
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setAnalysis(null);

    // Fetch image
    fetchNewsImage({ data: { title: item.title } }).then((res) => {
      if (!cancelled) setImage(res.imageUrl);
    });

    // Fetch AI analysis
    analyzeNews({
      data: {
        title: item.title,
        summary: item.summary,
        source: item.source,
        category: item.category,
      },
    })
      .then((res) => {
        if (!cancelled) setAnalysis(res.analysis);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Analysis failed.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [item]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-950/95 via-blue-950/80 to-slate-950/95 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,217,255,0.1)] flex flex-col"
      >
        {/* Header */}
        <div className="relative border-b border-cyan-500/15 bg-cyan-500/5 p-4 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[8px] font-mono uppercase tracking-wider text-cyan-300 border border-cyan-500/20">
                  {item.category}
                </span>
                <span className="font-mono text-[9px] text-slate-500">{item.source}</span>
                <span className="font-mono text-[9px] text-slate-600">{relTime(item.publishedAt)}</span>
              </div>
              <h2 className="text-sm font-semibold text-white leading-snug pr-8">
                {item.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-400 hover:text-white hover:border-cyan-500/30 transition shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Image banner */}
        {image && (
          <div className="relative h-32 overflow-hidden shrink-0">
            <img src={image} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          </div>
        )}

        {/* Section tabs */}
        <div className="flex gap-1 border-b border-cyan-500/10 px-4 py-2 shrink-0">
          {[
            { key: "report" as const, label: "Analysis Report", icon: FileText },
            { key: "youtube" as const, label: "YouTube Script", icon: Video },
            { key: "reel" as const, label: "Reel Script", icon: Film },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/30"
                    : "text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 gnet-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 border-t-cyan-400 animate-spin" />
                <div className="absolute inset-2 rounded-full border border-blue-400/20 border-b-blue-400 animate-spin" style={{ animationDirection: "reverse" }} />
                <Brain size={18} className="text-cyan-400 animate-pulse" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-400">
                  AI Deep Research Active
                </p>
                <p className="text-[10px] text-slate-500">
                  Analyzing signals, entities, and market impact...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
              {error}
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              {activeSection === "report" && (
                <>
                  <AnalysisSection label="01 · News Summary" content={analysis.summary} />
                  <AnalysisSection label="02 · Complete Explanation" content={analysis.explanation} />
                  <AnalysisSection label="03 · Background History" content={analysis.background} />
                  <AnalysisSection label="04 · Why This Happened" content={analysis.whyItHappened} />
                  <AnalysisSection label="05 · Companies & People" content={analysis.keyEntities} />
                  <AnalysisSection label="06 · Market Impact" content={analysis.marketImpact} />
                  <AnalysisSection label="07 · Investor Viewpoint" content={analysis.investorViewpoint} />
                  <AnalysisSection label="08 · Future Possibilities" content={analysis.futurePossibilities} />
                  <AnalysisSection label="09 · Risk Factors" content={analysis.riskFactors} />
                  <AnalysisSection label="10 · AI Conclusion" content={analysis.aiConclusion} highlight />
                </>
              )}
              {activeSection === "youtube" && (
                <ScriptCard title="YouTube Video Script (60s)" content={analysis.youtubeScript} />
              )}
              {activeSection === "reel" && (
                <ScriptCard title="Short Reel Script (30s)" content={analysis.reelScript} />
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="border-t border-cyan-500/10 px-4 py-2.5 shrink-0 flex items-center justify-between">
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 hover:text-cyan-300 transition"
          >
            <ExternalLink size={10} />
            View Original Source
          </a>
          <span className="font-mono text-[9px] text-slate-600">
            Powered by OPOAD AI Core · Gemini
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Analysis section ─── */
function AnalysisSection({
  label,
  content,
  highlight,
}: {
  label: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-cyan-400/30 bg-cyan-500/10"
          : "border-slate-800/60 bg-slate-950/40"
      }`}
    >
      <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/70 mb-1.5">
        {label}
      </p>
      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
}

/* ─── Script card ─── */
function ScriptCard({ title, content }: { title: string; content: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-950/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400/70">
          {title}
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(content).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="flex items-center gap-1 text-[9px] font-mono text-slate-400 hover:text-cyan-300 transition"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-mono">
        {content}
      </p>
    </div>
  );
}
