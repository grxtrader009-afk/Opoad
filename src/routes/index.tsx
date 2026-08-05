import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, useRef } from "react";
import {
  Bot,
  FolderKanban,
  Workflow,
  Microscope,
  BarChart3,
  Wallet,
  Shield,
  Image as ImageIcon,
  Clapperboard,
  Cloud,
  BookOpen,
  Megaphone,
  TrendingUp,
  Users,
  PiggyBank,
  Scale,
  Code2,
  Plug,
  MessageSquare,
  Globe2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Check,
  type LucideIcon,
} from "lucide-react";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { TopNav } from "@/components/dashboard/TopNav";
import { StatusBar } from "@/components/dashboard/StatusBar";
import { SettingsPanel } from "@/components/dashboard/SettingsPanel";
import { SettingsProvider } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/dashboard/ErrorBoundary";
import { DescribeBox } from "@/components/dashboard/DescribeBox";
import { CommandConsole } from "@/components/dashboard/CommandConsole";
import { AiProcessingOverlay } from "@/components/dashboard/AiProcessingOverlay";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Scene = lazy(() =>
  import("@/components/dashboard/Scene").then((m) => ({ default: m.Scene })),
);

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OPOAD — Intelligence · Automation · Future" },
      {
        name: "description",
        content:
          "OPOAD Operating System — a futuristic AI command center for global intelligence, automation and orchestration.",
      },
      { property: "og:title", content: "OPOAD Operating System" },
      {
        property: "og:description",
        content: "The operating system of the future. Global intelligence, powered by AI.",
      },
    ],
  }),
  beforeLoad: async () => {
    // Auth temporarily bypassed — Supabase project needs to be resumed.
    // Re-enable by uncommenting the block below after fixing Supabase.
    return;
    // if (typeof window === "undefined") return;
    // const { data } = await supabase.auth.getSession();
    // if (!data.session) { throw redirect({ to: "/login" }); }
  },
  component: DashboardRoute,
});

type ModuleDetail = {
  title: string;
  description: string;
  summary: string;
  bullets?: string[];
  accent: string;
  icon: LucideIcon;
  kind?: "research" | "legal" | "media";
  tabs?: string[];
  shortcuts?: string[];
};

type DashboardModule = {
  icon: LucideIcon;
  title: string;
  description: string;
  detail?: ModuleDetail;
};

const LEFT: DashboardModule[] = [
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Conversational reasoning core.",
    detail: {
      title: "AI Assistant",
      description: "Conversational Reasoning Core",
      summary:
        "The AI Assistant is your direct interface to the OPOAD intelligence engine. Ask questions, request analysis, or generate content using natural language.",
      accent: "Conversational AI",
      icon: Bot,
      tabs: ["Chat", "Context Memory", "Agent Config"],
    },
  },
  {
    icon: FolderKanban,
    title: "Projects",
    description: "Active initiatives orchestration.",
    detail: {
      title: "Projects",
      description: "Active Initiatives Orchestration",
      summary:
        "Manage all active projects, track progress, and coordinate teams. Create, edit, and monitor initiatives from a single command center.",
      accent: "Project management",
      icon: FolderKanban,
      shortcuts: ["Create New Project", "View All Projects", "Archive Completed"],
    },
  },
  {
    icon: Workflow,
    title: "Automation",
    description: "Autonomous task workflows.",
    detail: {
      title: "Automation",
      description: "Autonomous Task Workflows",
      summary:
        "Build and deploy automated workflows that run autonomously. Chain AI agents, triggers, and actions to eliminate repetitive work.",
      accent: "Workflow automation",
      icon: Workflow,
      tabs: ["Active Workflows", "Templates", "Trigger Builder"],
    },
  },
  {
    icon: Microscope,
    title: "Research",
    description: "Deep knowledge synthesis.",
    detail: {
      title: "Research",
      description: "AI Knowledge Synthesis Engine",
      summary:
        "Research mode is live. It can ingest signals, cross-reference evidence, and surface fresh briefs with the depth of an elite analyst team.",
      accent: "Knowledge synthesis",
      icon: Microscope,
      kind: "research",
      tabs: ["Market Analysis", "Competitor Reports", "Generate Synthesis"],
    },
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Real-time telemetry engine.",
    detail: {
      title: "Analytics",
      description: "Real-time Telemetry Engine",
      summary:
        "Monitor live system metrics, user engagement, and operational KPIs. Visualize trends and receive automated insight reports.",
      accent: "Data analytics",
      icon: BarChart3,
      tabs: ["Overview", "Traffic", "Conversions", "Real-time"],
    },
  },
  {
    icon: Wallet,
    title: "Finance",
    description: "Treasury & capital flows.",
    detail: {
      title: "Finance",
      description: "Treasury & Capital Flows",
      summary:
        "Track revenue, expenses, and capital allocation. Generate financial reports and forecast cash flow with AI-assisted projections.",
      accent: "Financial intelligence",
      icon: Wallet,
      tabs: ["Overview", "Transactions", "Forecasting"],
    },
  },
  {
    icon: Shield,
    title: "Security",
    description: "Zero-trust perimeter shield.",
    detail: {
      title: "Security",
      description: "Zero-Trust Perimeter Shield",
      summary:
        "Monitor threats, audit access logs, and enforce zero-trust security policies across all OPOAD services and endpoints.",
      accent: "Security operations",
      icon: Shield,
      tabs: ["Threat Map", "Access Logs", "Policy Engine"],
    },
  },
  {
    icon: ImageIcon,
    title: "Media",
    description: "Generative visual studio.",
    detail: {
      title: "Media",
      description: "Cinematic Pipeline Studio",
      summary:
        "Invoke a high-tech visual operations suite that turns scripts, concepts, and branding into launch-ready assets.",
      accent: "Visual production",
      icon: ImageIcon,
      kind: "media",
      tabs: ["Script-to-Video Generator", "Automated Thumbnail Creator"],
    },
  },
  {
    icon: Clapperboard,
    title: "Video Factory",
    description: "Cinematic pipeline.",
    detail: {
      title: "Video Factory",
      description: "Cinematic Pipeline",
      summary:
        "Orchestrate multi-scene storyboards, generated voiceover, auto-edits, and thumbnail variants with one live command center.",
      accent: "Video orchestration",
      icon: Clapperboard,
      kind: "media",
      tabs: ["Script-to-Video Generator", "Automated Thumbnail Creator"],
    },
  },
  {
    icon: Cloud,
    title: "Cloud",
    description: "Distributed compute grid.",
    detail: {
      title: "Cloud",
      description: "Distributed Compute Grid",
      summary:
        "Manage cloud infrastructure, scale compute resources, and monitor node health across the global OPOAD distribution network.",
      accent: "Cloud infrastructure",
      icon: Cloud,
      tabs: ["Nodes", "Scaling", "Health Monitor"],
    },
  },
];

const RIGHT: DashboardModule[] = [
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Persistent memory vault.",
    detail: {
      title: "Knowledge Base",
      description: "Persistent Memory Vault",
      summary:
        "A searchable repository of accumulated knowledge, documents, and AI-generated insights. The system remembers and learns from every interaction.",
      accent: "Knowledge management",
      icon: BookOpen,
      tabs: ["Documents", "AI Insights", "Search"],
    },
  },
  {
    icon: Megaphone,
    title: "Marketing",
    description: "Attention orchestration.",
    detail: {
      title: "Marketing",
      description: "Attention Orchestration",
      summary:
        "Plan, launch, and track marketing campaigns across channels. AI-powered audience targeting and content scheduling.",
      accent: "Marketing automation",
      icon: Megaphone,
      tabs: ["Campaigns", "Audience", "Scheduler"],
    },
  },
  {
    icon: TrendingUp,
    title: "Sales",
    description: "Revenue intelligence.",
    detail: {
      title: "Sales",
      description: "Revenue Intelligence",
      summary:
        "Track pipeline, forecast revenue, and identify high-value opportunities with AI-assisted lead scoring and conversion analytics.",
      accent: "Sales intelligence",
      icon: TrendingUp,
      tabs: ["Pipeline", "Forecast", "Leads"],
    },
  },
  {
    icon: Users,
    title: "HR",
    description: "Talent operating layer.",
    detail: {
      title: "HR",
      description: "Talent Operating Layer",
      summary:
        "Manage team members, roles, and performance. AI-assisted recruitment, onboarding, and workforce analytics.",
      accent: "Human resources",
      icon: Users,
      tabs: ["Team", "Roles", "Performance"],
    },
  },
  {
    icon: PiggyBank,
    title: "Investments",
    description: "Portfolio intelligence.",
    detail: {
      title: "Investments",
      description: "Portfolio Intelligence",
      summary:
        "Monitor investment portfolios, track asset performance, and receive AI-generated risk assessments and allocation recommendations.",
      accent: "Investment intelligence",
      icon: PiggyBank,
      tabs: ["Portfolio", "Risk Analysis", "Allocations"],
    },
  },
  {
    icon: Scale,
    title: "Legal",
    description: "Contract & compliance AI.",
    detail: {
      title: "Legal",
      description: "Contract & Compliance Dashboard",
      summary:
        "Legal intelligence is active and can review clauses, flag risk, and generate approval-ready summaries with a human-in-the-loop workflow.",
      accent: "Compliance intelligence",
      icon: Scale,
      kind: "legal",
      shortcuts: [
        "Government Registry Links (MCA, India Code)",
        "Legal Notice Generator Template",
        "Compliance Checklist Builder",
      ],
    },
  },
  {
    icon: Code2,
    title: "Developer Hub",
    description: "Build environments.",
    detail: {
      title: "Developer Hub",
      description: "Build Environments",
      summary:
        "Access development tools, manage build pipelines, and deploy code. AI-assisted code review and debugging.",
      accent: "Developer tools",
      icon: Code2,
      tabs: ["Pipelines", "Environments", "Code Review"],
    },
  },
  {
    icon: Plug,
    title: "API Center",
    description: "Integration mesh.",
    detail: {
      title: "API Center",
      description: "Integration Mesh",
      summary:
        "Manage API keys, webhooks, and third-party integrations. Monitor API health and usage analytics.",
      accent: "API management",
      icon: Plug,
      tabs: ["Keys", "Webhooks", "Health"],
    },
  },
  {
    icon: MessageSquare,
    title: "Community",
    description: "Signal & discourse.",
    detail: {
      title: "Community",
      description: "Signal & Discourse",
      summary:
        "Engage with the OPOAD community. Track discussions, feedback, and user-generated content across the platform.",
      accent: "Community management",
      icon: MessageSquare,
      tabs: ["Discussions", "Feedback", "Moderation"],
    },
  },
  {
    icon: Globe2,
    title: "Global Network",
    description: "Planetary presence.",
    detail: {
      title: "Global Network",
      description: "Planetary Presence",
      summary:
        "Monitor global server distribution, latency maps, and regional compliance. Manage CDN and edge node configuration.",
      accent: "Global infrastructure",
      icon: Globe2,
      tabs: ["World Map", "Latency", "Compliance"],
    },
  },
];

export interface ResearchNewsItem {
  id: string;
  category: "Finance" | "Business" | "Technology" | "Indian Govt Policy";
  title: string;
  description: string;
  time: string;
  hindi: string;
  english: string;
  fullHindiScript: string;
  fullEnglishScript: string;
}

export const LIVE_RESEARCH_NEWS: ResearchNewsItem[] = [
  {
    id: "news-1",
    category: "Finance",
    title: "RBI Repo Rate Maintained at 6.5%",
    description:
      "The Reserve Bank of India keeps the policy repo rate unchanged, prioritizing retail inflation control while supporting sustainable GDP growth.",
    time: "5 mins ago",
    hindi:
      "आरबीआई ने नीतिगत रेपो दर को 6.5% पर अपरिवर्तित रखा है, जिससे मुद्रास्फीति नियंत्रण को प्राथमिकता दी जा सके।",
    english:
      "The Reserve Bank of India has maintained the key repo rate at 6.5%, aiming to keep retail inflation under control.",
    fullHindiScript:
      "[HOOK] नमस्कार दोस्तों! आरबीआई का बड़ा फैसला आ गया है। नीतिगत रेपो दर को बिना किसी बदलाव के 6.5% पर रखा गया है।\n\n[BODY] इसका सीधा मतलब है कि आपके होम लोन और कार लोन की ईएमआई फिलहाल स्थिर रहेगी। केंद्रीय बैंक का मुख्य ध्यान महंगाई को नियंत्रित करने और आर्थिक विकास को गति देने पर है। भारतीय बाजारों के लिए यह स्थिरता काफी सकारात्मक संकेत लेकर आई है।\n\n[OUTRO] क्या आपको लगता है कि यह सही कदम है? नीचे कमेंट्स में बताएं और इस वीडियो को शेयर करना न भूलें!",
    fullEnglishScript:
      "[HOOK] Hello everyone! Huge news from the Reserve Bank of India today. The repo rate remains unchanged at 6.5%.\n\n[BODY] This means your home loan and car loan EMIs will remain steady for now. The central bank is striking a perfect balance between curbing retail inflation and fueling economic growth across sectors.\n\n[OUTRO] Do you agree with the RBI's decision? Let us know in the comments below, and don't forget to follow for more daily updates!",
  },
  {
    id: "news-2",
    category: "Business",
    title: "Tata Group's ₹12,000 Cr Semiconductor Assembly Unit",
    description:
      "Tata Electronics is setting up a state-of-the-art semiconductor assembly and testing facility in Assam, creating over 20,000 jobs.",
    time: "20 mins ago",
    hindi:
      "टाटा समूह असम में ₹12,000 करोड़ का सेमीकंडक्टर असेंबली और परीक्षण संयंत्र स्थापित कर रहा है, जिससे 20,000 नौकरियां पैदा होंगी।",
    english:
      "Tata Group is establishing a ₹12,000 crore semiconductor assembly and testing facility in Assam, creating 20,000 jobs.",
    fullHindiScript:
      "[HOOK] भारत अब सेमीकंडक्टर क्षेत्र का महाशक्ति बनने जा रहा है! टाटा समूह असम में लगाने जा रहा है ₹12,000 करोड़ का असेंबली प्लांट।\n\n[BODY] इस अत्याधुनिक प्लांट से पूर्वोत्तर भारत में 20,000 से अधिक लोगों को प्रत्यक्ष और अप्रत्यक्ष रोजगार मिलेगा। यह कदम भारत की इलेक्ट्रॉनिक्स और हार्डवेयर विनिर्माण क्षमता को वैश्विक स्तर पर बढ़ाएगा।\n\n[OUTRO] भारत के इस ऐतिहासिक कदम के बारे में आपकी क्या राय है? कमेंट में लिखें और वीडियो को शेयर करें!",
    fullEnglishScript:
      "[HOOK] India is on its way to becoming a global semiconductor powerhouse! Tata Group is setting up a massive ₹12,000 crore testing unit in Assam.\n\n[BODY] This advanced plant is expected to generate over 20,000 high-tech jobs, bolstering local chip-manufacturing capabilities and cementing India's footprint in the global technology supply chain.\n\n[OUTRO] Exciting times ahead for tech and manufacturing in India! Share your thoughts below and hit that subscribe button.",
  },
  {
    id: "news-3",
    category: "Technology",
    title: "Sovereign AI Cloud Nodes Live in India",
    description:
      "New localized high-compute cloud infrastructure launched in Delhi-NCR, allowing Indian developers to host large language models locally with zero data sovereignty risk.",
    time: "45 mins ago",
    hindi:
      "दिल्ली-एनसीआर में नया सॉवरेन एआई क्लाउड इंफ्रास्ट्रक्चर लॉन्च किया गया है, जो भारतीय डेवलपर्स को बिना डेटा जोखिम के एलएलएम को स्थानीय स्तर पर होस्ट करने की अनुमति देता है।",
    english:
      "New sovereign high-compute AI cloud infrastructure goes live in Delhi-NCR, enabling local LLM hosting under strict compliance.",
    fullHindiScript:
      "[HOOK] भारतीय डेवलपर्स के लिए सबसे बड़ी खुशखबरी! दिल्ली-एनसीआर में सॉवरेन एआई क्लाउड इंफ्रास्ट्रक्चर पूरी तरह से लाइव हो गया है।\n\n[BODY] अब आप अपने बड़े भाषा मॉडलों (LLMs) को बिना किसी डेटा गोपनीयता जोखिम के पूरी सुरक्षा के साथ भारत में ही होस्ट कर सकते हैं। यह भारत के खुद के एआई इकोसिस्टम को अत्यधिक मजबूती प्रदान करेगा।\n\n[OUTRO] अगर आप एक डेवलपर हैं, तो यह खबर आपके लिए गेम-चेंजर है। ऐसी और टेक अपडेट्स के लिए तुरंत फॉलो करें!",
    fullEnglishScript:
      "[HOOK] Big news for Indian AI developers! A new sovereign, high-compute AI cloud infrastructure is now live in Delhi-NCR.\n\n[BODY] This launch allows developers to train and run large language models locally, ensuring complete compliance with local data privacy regulations while reducing latency dramatically.\n\n[OUTRO] Are you planning to build something on this new infrastructure? Let us know, and subscribe for more tech breakthroughs!",
  },
  {
    id: "news-4",
    category: "Indian Govt Policy",
    title: "Digital India Act Intermediary Draft Guidelines Released",
    description:
      "The Ministry of Electronics and IT publishes draft rules for AI systems, making third-party auditing mandatory for high-risk generative models before public launch.",
    time: "1 hour ago",
    hindi:
      "इलेक्ट्रॉनिक्स और आईटी मंत्रालय ने एआई सिस्टम के लिए नियम जारी किए हैं, जिससे जोखिम वाले जनरेटिव मॉडल के लिए ऑडिट अनिवार्य हो गया है।",
    english:
      "The IT Ministry publishes draft rules for AI, making independent audits mandatory for high-risk models before public deployment.",
    fullHindiScript:
      "[HOOK] क्या भारत में अब एआई मॉडल्स लॉन्च करना मुश्किल होने वाला है? डिजिटल इंडिया एक्ट के नए ड्राफ्ट नियमों को समझें।\n\n[BODY] नए नियमों के तहत, किसी भी हाई-रिस्क जनरेटिव एआई मॉडल को जनता के लिए जारी करने से पहले सरकार द्वारा अधिकृत थर्ड-पार्टी ऑडिटिंग से गुजरना होगा ताकि सुरक्षा और गोपनीयता बनी रहे। इसका उद्देश्य एआई के दुरुपयोग को रोकना है।\n\n[OUTRO] सुरक्षा के लिहाज से यह बेहद महत्वपूर्ण कदम है। इस नए कानून पर अपने विचार कमेंट्स में साझा करें!",
    fullEnglishScript:
      "[HOOK] Is India regulating AI? The latest draft guidelines under the Digital India Act are here, and they are strict.\n\n[BODY] All high-risk generative AI systems must now undergo a mandatory third-party audit before being deployed for public use. This aims to secure user privacy and tackle algorithmic bias.\n\n[OUTRO] What do you think about this regulatory push? Drop your comments below and make sure to follow for the latest policy updates!",
  },
];

function DashboardRoute() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  // Auth check bypassed temporarily — re-enable after Supabase is restored
  // useEffect(() => {
  //   if (!loading && !session) { navigate({ to: "/login" }); }
  // }, [session, loading, navigate]);

  return (
    <SettingsProvider>
      <Dashboard />
    </SettingsProvider>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleDetail | null>(null);

  // --- FUTURISTIC OPOAD AI DESCRIBE BOX STATES & HANDLERS ---
  const [selectedDashboardArticle, setSelectedDashboardArticle] = useState<{
    title: string;
    description: string;
    id: string;
  } | null>(null);

  const [aiProcessingOpen, setAiProcessingOpen] = useState(false);
  const [pendingScriptTitle, setPendingScriptTitle] = useState("");
  const [pendingScriptDesc, setPendingScriptDesc] = useState("");

  const handleGenerateScriptFromDescribe = (title: string, desc: string) => {
    setPendingScriptTitle(title);
    setPendingScriptDesc(desc);
    setAiProcessingOpen(true);
  };

  const handleAiProcessingComplete = () => {
    setAiProcessingOpen(false);
    const title = pendingScriptTitle;
    const desc = pendingScriptDesc;

    setResearchScriptTitle(title);
    setResearchScriptDesc(desc);
    setSelectedResearchNewsId(""); // Set to custom/dynamic script source
    setGeneratedHindiScript(
      `[HOOK] ताजा जानकारी! ${title || "खबर"} को लेकर बड़ा विश्लेषण शुरू हो गया है।\n\n[BODY] ${desc || "पूरी रिपोर्ट"} हमारे पास आ चुकी है। इस घटना से पूरे बाजार और संबंधित उद्योगों पर गहरा प्रभाव देखने को मिल सकता है। विशेषज्ञ इसके दुर्गामी परिणामों का बारीकी से अध्ययन कर रहे हैं।\n\n[OUTRO] इस महत्वपूर्ण बदलाव पर आपका क्या सोचना है? नीचे कमेंट बॉक्स में जरूर साझा करें!`,
    );
    setGeneratedEnglishScript(
      `[HOOK] Breaking update! We are breaking down the critical details on: ${title || "the news"}.\n\n[BODY] Analyzing the key takeaway: ${desc || "this development"}. Experts suggest this event will trigger strong waves of innovation and regulatory changes across the entire spectrum.\n\n[OUTRO] Let us know what you think about this major shift in the comment section below. Remember to subscribe!`,
    );
    // Find the research detail module definitions to open the modal
    const researchModule = LEFT.find((m) => m.detail?.kind === "research")?.detail;
    if (researchModule) {
      setActiveModule(researchModule);
    }
  };

  // --- CUSTOM RESEARCH TELEPROMPTER MODULE STATES & REFS ---
  const [selectedResearchNewsId, setSelectedResearchNewsId] = useState<string>("news-1");
  const [researchCategoryFilter, setResearchCategoryFilter] = useState<string>("All");
  const [researchScriptTitle, setResearchScriptTitle] = useState<string>(
    LIVE_RESEARCH_NEWS[0].title,
  );
  const [researchScriptDesc, setResearchScriptDesc] = useState<string>(
    LIVE_RESEARCH_NEWS[0].description,
  );
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<1 | 2>(1);
  const [isTeleprompterPlaying, setIsTeleprompterPlaying] = useState<boolean>(false);
  const [teleprompterFontSize, setTeleprompterFontSize] = useState<"sm" | "base" | "lg" | "xl">(
    "lg",
  );
  const [isGeneratingScript, setIsGeneratingScript] = useState<boolean>(false);
  const [generatedHindiScript, setGeneratedHindiScript] = useState<string>(
    LIVE_RESEARCH_NEWS[0].fullHindiScript,
  );
  const [generatedEnglishScript, setGeneratedEnglishScript] = useState<string>(
    LIVE_RESEARCH_NEWS[0].fullEnglishScript,
  );
  const teleprompterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isTeleprompterPlaying) return;
    const scrollContainer = teleprompterRef.current;
    if (!scrollContainer) return;

    let lastTime = performance.now();
    let animationFrameId: number;

    const scroll = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (scrollContainer) {
        const speedFactor = teleprompterSpeed === 1 ? 0.04 : 0.09;
        scrollContainer.scrollTop += delta * speedFactor;

        if (
          scrollContainer.scrollTop + scrollContainer.clientHeight >=
          scrollContainer.scrollHeight - 5
        ) {
          setIsTeleprompterPlaying(false);
        } else {
          animationFrameId = requestAnimationFrame(scroll);
        }
      }
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isTeleprompterPlaying, teleprompterSpeed]);

  const [legalName, setLegalName] = useState("Aarav Sharma");
  const [legalAmount, setLegalAmount] = useState("250000");
  const [legalNotice, setLegalNotice] = useState<string | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<Record<string, boolean>>(() => ({
    "Board Resolution": false,
    "Entity Verification": false,
    "IP Review": false,
    "Notice Archive": false,
  }));
  const [newsFeed, setNewsFeed] = useState([
    {
      category: "Finance",
      headline: "Global liquidity rally lifts sovereign bond demand.",
      timer: "Top 1 - 2 mins ago",
    },
    {
      category: "Politics",
      headline: "Coalition leaders accelerate climate policy negotiations.",
      timer: "Top 2 - 5 mins ago",
    },
    {
      category: "Business",
      headline: "Enterprise AI spend reaches new highs across the region.",
      timer: "Top 3 - 8 mins ago",
    },
  ]);
  const [researchDispatchMessage, setResearchDispatchMessage] = useState("");
  const [researchScript, setResearchScript] = useState(
    "Open with a bold reveal, then connect the trend to a creator's next distribution angle.",
  );
  const [activeResearchTab, setActiveResearchTab] = useState<"news" | "synthesis">("news");
  const [activeLegalTab, setActiveLegalTab] = useState<
    "registries" | "ecourts" | "notice" | "checklist"
  >("registries");
  const [legalPhrase, setLegalPhrase] = useState(
    "The creator is discussing a false endorsement claim and needs a formal notice.",
  );
  const [legalMatches, setLegalMatches] = useState<
    Array<{ label: string; url: string; reason: string }>
  >([]);
  const [legalTemplate, setLegalTemplate] = useState("");
  const [activeMediaTab, setActiveMediaTab] = useState<"teleprompter" | "analyst" | "editor">(
    "teleprompter",
  );
  const [scriptInput, setScriptInput] = useState(
    "Open the product with a cinematic reveal and explain the intelligence layer in three short beats.",
  );
  const [renderProgress, setRenderProgress] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isRendering) return;

    const timer = window.setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          setIsRendering(false);
          return 100;
        }
        return prev + 8;
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [isRendering]);

  useEffect(() => {
    if (activeModule?.kind !== "research") return;

    const timer = window.setInterval(() => {
      setNewsFeed((prev) =>
        prev.map((item, index) => ({
          ...item,
          timer:
            index === 0
              ? `Top 1 - ${Math.floor(Math.random() * 4) + 1} mins ago`
              : `${item.category} • ${Math.floor(Math.random() * 6) + 1} mins ago`,
        })),
      );
    }, 1600);

    return () => window.clearInterval(timer);
  }, [activeModule?.kind]);

  useEffect(() => {
    const normalized = legalPhrase.toLowerCase();
    const matches = [
      {
        label: "MCA Registry",
        url: "https://www.mca.gov.in",
        reason: "Matches company, incorporation, director, and compliance references.",
      },
      {
        label: "India Code",
        url: "https://www.indiacode.nic.in",
        reason: "Matches statutory language, legal sections, and formal notice references.",
      },
    ].filter((item) => {
      if (item.label === "MCA Registry") {
        return /company|incorporation|director|compliance|corporate|filing/.test(normalized);
      }
      return /law|section|statute|act|legal|notice|ip|trademark|copyright/.test(normalized);
    });

    setLegalMatches(matches);
  }, [legalPhrase]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="starfield" />
        <div className="grid-overlay" />
        <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.15_230/0.18),transparent_60%)] blur-2xl" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      {/* 3D Scene — full-bleed behind UI */}
      <div className="absolute inset-0 z-0">
        <ErrorBoundary fallback={<div className="absolute inset-0 bg-[#05070A]" />}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* UI layer */}
      <div className="pointer-events-none relative z-10 flex min-h-screen flex-col">
        <TopNav onOpenSettings={() => setSettingsOpen(true)} />

        <main className="flex flex-1 flex-col gap-4 px-4 pb-40 pt-4 md:px-6">
          {/* ── Full-width AI Workspace (top row) ── */}
          <CommandConsole />

          {/* ── Three-column row (cards pushed down) ── */}
          <div className="flex flex-1 items-stretch gap-4 mt-2">
          <section className="pointer-events-auto grid w-full max-w-xs shrink-0 grid-cols-2 content-start auto-rows-fr gap-3 md:max-w-sm lg:max-w-md self-start mt-6">
            {LEFT.map((m, i) => (
              <ModuleCard
                key={m.title}
                {...m}
                delay={0.05 * i}
                onOpenDetails={
                  m.detail
                    ? () => {
                        if (m.title === "Projects") {
                          navigate({ to: "/projects" });
                        } else {
                          setActiveModule(m.detail ?? null);
                        }
                      }
                    : undefined
                }
              />
            ))}
          </section>

          <section className="hidden flex-1 flex-col items-center justify-between py-6 lg:flex pointer-events-auto mt-6">
            <div className="glass rounded-full px-5 py-2 text-center animate-floaty">
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-400 text-glow">
                Global Intelligence Core
              </p>
            </div>

            {/* Clean center — Earth remains the visual focus */}
            <div className="w-full flex-1" />

            <div className="glass-strong mt-auto flex items-center gap-6 rounded-2xl px-6 py-3 animate-floaty">
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  AI Core
                </p>
                <p className="mt-0.5 text-lg font-light text-foreground text-glow tabular-nums">
                  v9.42
                </p>
              </div>
              <span className="h-8 w-px bg-primary/30" />
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Uptime
                </p>
                <p className="mt-0.5 text-lg font-light text-foreground text-glow tabular-nums">
                  99.999%
                </p>
              </div>
              <span className="h-8 w-px bg-primary/30" />
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground">
                  Signals
                </p>
                <p className="mt-0.5 text-lg font-light text-foreground text-glow tabular-nums">
                  1.2M/s
                </p>
              </div>
            </div>
          </section>

          <section className="pointer-events-auto ml-auto grid w-full max-w-xs shrink-0 grid-cols-2 content-start auto-rows-fr gap-3 md:max-w-sm lg:max-w-md self-start mt-6">
            {RIGHT.map((m, i) => (
              <ModuleCard
                key={m.title}
                {...m}
                delay={0.05 * i + 0.15}
                onOpenDetails={
                  m.detail
                    ? () => {
                        if (m.title === "Projects") {
                          navigate({ to: "/projects" });
                        } else {
                          setActiveModule(m.detail ?? null);
                        }
                      }
                    : undefined
                }
              />
            ))}
          </section>
          </div>{/* end three-column row */}
        </main>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 px-4">
          <StatusBar />
        </div>
      </div>

      <Dialog
        open={Boolean(activeModule)}
        onOpenChange={(open: boolean) => !open && setActiveModule(null)}
      >
        <DialogContent className="max-w-2xl border border-primary/25 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_45%),rgba(2,6,23,0.95)] p-0 shadow-[0_0_80px_-20px_var(--color-glow)] sm:rounded-[28px]">
          {activeModule && (
            <>
              <div className="relative overflow-hidden rounded-t-[28px] border-b border-primary/20 bg-primary/10 p-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.12),transparent_60%)]" />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/40 bg-background/70 text-primary">
                      <activeModule.icon size={22} strokeWidth={1.4} />
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary/70">
                        {activeModule.accent}
                      </p>
                      <DialogTitle className="text-xl font-semibold text-foreground">
                        {activeModule.title}
                      </DialogTitle>
                    </div>
                  </div>
                  <div className="rounded-full border border-primary/30 bg-background/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
                    Active
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6">
                <DialogHeader className="space-y-2 text-left">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    {activeModule.description}
                  </DialogTitle>
                  <DialogDescription className="text-base leading-7 text-muted-foreground">
                    {activeModule.summary}
                  </DialogDescription>
                </DialogHeader>

                {activeModule.kind === "research" ? (
                  <div className="space-y-6">
                    {/* Top description */}
                    <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-foreground">
                      <p className="font-medium text-primary">
                        Microsecond Real-Time News Streamer & Teleprompter
                      </p>
                      <p className="mt-1 text-muted-foreground">
                        Select an active news wire below to pass it directly into the AI Script
                        Generator and launch the bilingual scrolling teleprompter.
                      </p>
                    </div>

                    {/* Category Selector */}
                    <div className="space-y-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Filter News Stream
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {["All", "Finance", "Business", "Technology", "Indian Govt Policy"].map(
                          (cat) => {
                            const isActive = researchCategoryFilter === cat;
                            return (
                              <button
                                key={cat}
                                type="button"
                                onClick={() => setResearchCategoryFilter(cat)}
                                className={`rounded-full px-3 py-1 text-xs font-medium border transition ${
                                  isActive
                                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                                    : "border-primary/10 bg-background/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                                }`}
                              >
                                {cat}
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* News cards list */}
                    <div className="space-y-2">
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Interactive News Cards
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2 max-h-56 overflow-y-auto pr-1">
                        {LIVE_RESEARCH_NEWS.filter(
                          (item) =>
                            researchCategoryFilter === "All" ||
                            item.category === researchCategoryFilter,
                        ).map((item) => {
                          const isSelected = selectedResearchNewsId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSelectedResearchNewsId(item.id);
                                setResearchScriptTitle(item.title);
                                setResearchScriptDesc(item.description);
                                setGeneratedHindiScript(item.fullHindiScript);
                                setGeneratedEnglishScript(item.fullEnglishScript);
                                setIsTeleprompterPlaying(false);
                                if (teleprompterRef.current) {
                                  teleprompterRef.current.scrollTop = 0;
                                }
                              }}
                              className={`group cursor-pointer rounded-xl border p-3 text-left transition duration-200 ${
                                isSelected
                                  ? "border-cyan-400 bg-cyan-950/20 shadow-[0_0_12px_rgba(34,211,238,0.15)]"
                                  : "border-primary/10 bg-background/40 hover:border-cyan-500/30 hover:bg-background/60"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-primary/80">
                                  {item.category}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {item.time}
                                </span>
                              </div>
                              <h4 className="mt-1.5 text-xs font-semibold text-foreground group-hover:text-cyan-200 transition">
                                {item.title}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground leading-relaxed">
                                {item.description}
                              </p>
                              <div className="mt-2 flex items-center justify-end text-[10px] text-cyan-400/80 font-mono gap-1">
                                {isSelected ? (
                                  <>
                                    <Check size={10} className="text-cyan-400" />
                                    <span>Selected & Loaded</span>
                                  </>
                                ) : (
                                  <span className="opacity-0 group-hover:opacity-100 transition duration-200">
                                    Click to load
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI Script generation & teleprompter section */}
                    <div className="rounded-2xl border border-primary/20 bg-background/50 p-4 space-y-4">
                      <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                        <div className="flex items-center gap-2">
                          <Sparkles size={14} className="text-cyan-400 animate-pulse" />
                          <h3 className="text-xs font-mono uppercase tracking-wider text-foreground">
                            AI Script Studio State
                          </h3>
                        </div>
                        <span className="text-[9px] bg-cyan-950/40 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-mono">
                          Bilingual Engine Ready
                        </span>
                      </div>

                      {/* Title & description inputs (passes news item content) */}
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase">
                            Source Headline
                          </label>
                          <input
                            type="text"
                            value={researchScriptTitle}
                            onChange={(e) => setResearchScriptTitle(e.target.value)}
                            className="w-full rounded-lg border border-primary/15 bg-background/80 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-cyan-500/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-muted-foreground uppercase">
                            Source Description
                          </label>
                          <input
                            type="text"
                            value={researchScriptDesc}
                            onChange={(e) => setResearchScriptDesc(e.target.value)}
                            className="w-full rounded-lg border border-primary/15 bg-background/80 px-2.5 py-1.5 text-xs text-foreground outline-none focus:border-cyan-500/40"
                          />
                        </div>
                      </div>

                      {/* Generate script button */}
                      <Button
                        type="button"
                        onClick={() => {
                          setIsGeneratingScript(true);
                          setIsTeleprompterPlaying(false);
                          if (teleprompterRef.current) {
                            teleprompterRef.current.scrollTop = 0;
                          }
                          setTimeout(() => {
                            setIsGeneratingScript(false);
                            // Set custom generated scripts based on input values
                            setGeneratedHindiScript(
                              `[HOOK] ताजा जानकारी! ${researchScriptTitle || "खबर"} को लेकर बड़ा विश्लेषण शुरू हो गया है।\n\n[BODY] ${researchScriptDesc || "पूरी रिपोर्ट"} हमारे पास आ चुकी है। इस घटना से पूरे बाजार और संबंधित उद्योगों पर गहरा प्रभाव देखने को मिल सकता है। विशेषज्ञ इसके दुर्गामी परिणामों का बारीकी से अध्ययन कर रहे हैं।\n\n[OUTRO] इस महत्वपूर्ण बदलाव पर आपका क्या सोचना है? नीचे कमेंट बॉक्स में जरूर साझा करें!`,
                            );
                            setGeneratedEnglishScript(
                              `[HOOK] Breaking update! We are breaking down the critical details on: ${researchScriptTitle || "the news"}.\n\n[BODY] Analyzing the key takeaway: ${researchScriptDesc || "this development"}. Experts suggest this event will trigger strong waves of innovation and regulatory changes across the entire spectrum.\n\n[OUTRO] Let us know what you think about this major shift in the comment section below. Remember to subscribe!`,
                            );
                          }, 1200);
                        }}
                        disabled={isGeneratingScript}
                        className="w-full justify-center bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400/20 font-medium text-xs py-1.5 transition"
                      >
                        {isGeneratingScript ? (
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            <span>Synthesizing Bilingual Audio Script...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Sparkles size={12} className="text-white animate-bounce" />
                            <span>Generate Script</span>
                          </div>
                        )}
                      </Button>

                      {/* TELEPROMPTER VIEWPORT */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                            Hindi/English Teleprompter Scroll Screen
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                            <span className="text-[9px] font-mono text-green-400 uppercase tracking-widest">
                              {isTeleprompterPlaying ? "SCROLLING" : "PAUSED"}
                            </span>
                          </div>
                        </div>

                        {/* Hardware-styled Screen Frame */}
                        <div className="relative rounded-xl border border-cyan-500/20 bg-black p-1 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                          {/* Inside highlight strip */}
                          <div className="pointer-events-none absolute left-0 right-0 top-1/2 z-10 h-12 -translate-y-1/2 border-y border-cyan-400/20 bg-cyan-500/5 shadow-[inset_0_0_8px_rgba(34,211,238,0.1)]" />

                          {/* Dual Scroll Content */}
                          <div
                            ref={teleprompterRef}
                            className={`h-48 overflow-y-auto scroll-smooth px-4 py-16 text-center select-none ${
                              teleprompterFontSize === "sm"
                                ? "text-xs"
                                : teleprompterFontSize === "base"
                                  ? "text-sm"
                                  : teleprompterFontSize === "lg"
                                    ? "text-base"
                                    : "text-lg"
                            }`}
                          >
                            <div className="space-y-6">
                              {/* Title / Info block */}
                              <div className="opacity-40">
                                <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">
                                  --- START TELEPROMPTER READ ---
                                </p>
                                <p className="text-xs mt-1 font-semibold text-white uppercase tracking-wider">
                                  {researchScriptTitle}
                                </p>
                              </div>

                              {/* Hindi Section */}
                              <div className="space-y-4">
                                <div className="rounded bg-amber-500/5 border border-amber-500/10 py-1 text-[10px] font-mono text-amber-400 inline-block px-3 uppercase tracking-wider">
                                  HINDI SECTION (हिंदी पाठ)
                                </div>
                                <p className="font-semibold text-amber-300 leading-relaxed whitespace-pre-wrap">
                                  {generatedHindiScript}
                                </p>
                              </div>

                              <div className="h-6" />

                              {/* English Section */}
                              <div className="space-y-4">
                                <div className="rounded bg-cyan-500/5 border border-cyan-500/10 py-1 text-[10px] font-mono text-cyan-400 inline-block px-3 uppercase tracking-wider">
                                  ENGLISH SECTION (अंग्रेजी पाठ)
                                </div>
                                <p className="font-semibold text-cyan-300 leading-relaxed whitespace-pre-wrap">
                                  {generatedEnglishScript}
                                </p>
                              </div>

                              <div className="opacity-40 pt-4">
                                <p className="text-[10px] uppercase tracking-widest text-cyan-400 font-mono">
                                  --- END OF SCRIPT ---
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Teleprompter Controls */}
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/10 bg-background/60 p-2.5">
                          {/* Play/Pause */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setIsTeleprompterPlaying(!isTeleprompterPlaying)}
                              className={`flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition ${
                                isTeleprompterPlaying
                                  ? "bg-amber-600 hover:bg-amber-500 text-white"
                                  : "bg-cyan-600 hover:bg-cyan-500 text-white"
                              }`}
                            >
                              {isTeleprompterPlaying ? (
                                <>
                                  <Pause size={12} fill="currentColor" />
                                  <span>Pause</span>
                                </>
                              ) : (
                                <>
                                  <Play size={12} fill="currentColor" />
                                  <span>Play</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setIsTeleprompterPlaying(false);
                                if (teleprompterRef.current) {
                                  teleprompterRef.current.scrollTop = 0;
                                }
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/15 bg-background/30 text-muted-foreground hover:border-primary/30 hover:text-foreground transition"
                              title="Reset Scroll"
                            >
                              <RotateCcw size={12} />
                            </button>
                          </div>

                          {/* Speed Controls */}
                          <div className="flex items-center gap-1 rounded-lg border border-primary/10 bg-background/40 p-0.5">
                            <span className="px-2 text-[9px] font-mono text-muted-foreground uppercase">
                              Speed
                            </span>
                            <button
                              type="button"
                              onClick={() => setTeleprompterSpeed(1)}
                              className={`rounded-md px-2 py-1 text-xs font-mono transition ${
                                teleprompterSpeed === 1
                                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              1x
                            </button>
                            <button
                              type="button"
                              onClick={() => setTeleprompterSpeed(2)}
                              className={`rounded-md px-2 py-1 text-xs font-mono transition ${
                                teleprompterSpeed === 2
                                  ? "bg-cyan-500/20 text-cyan-300 font-bold"
                                  : "text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              2x
                            </button>
                          </div>

                          {/* Font Size Adjusters */}
                          <div className="flex items-center gap-1 rounded-lg border border-primary/10 bg-background/40 p-0.5">
                            <span className="px-2 text-[9px] font-mono text-muted-foreground uppercase">
                              Size
                            </span>
                            {(["sm", "base", "lg", "xl"] as const).map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => setTeleprompterFontSize(sz)}
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-mono transition uppercase ${
                                  teleprompterFontSize === sz
                                    ? "bg-cyan-500/20 text-cyan-300 font-bold"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activeModule.kind === "legal" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-foreground">
                      <p className="font-medium text-foreground">
                        Pyramid AI Analyst - Legal Module
                      </p>
                      <p className="mt-2 text-muted-foreground">
                        The workspace keeps government registry access, case tracking, notice
                        drafting, and compliance review in one live legal command center.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: "registries", label: "Government Registries" },
                          { id: "ecourts", label: "e-Courts Case Tracker" },
                          { id: "notice", label: "Legal Notice Generator" },
                          { id: "checklist", label: "Compliance Checklist" },
                        ] as Array<{
                          id: "registries" | "ecourts" | "notice" | "checklist";
                          label: string;
                        }>
                      ).map((tab) => {
                        const isActive = activeLegalTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveLegalTab(tab.id)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${isActive ? "border-primary/40 bg-primary/10 text-foreground" : "border-primary/15 bg-background/60 text-muted-foreground"}`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {activeLegalTab === "registries" ? (
                      <div className="space-y-3">
                        <div className="grid gap-2 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() =>
                              window.open("https://www.mca.gov.in", "_blank", "noopener,noreferrer")
                            }
                            className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/10"
                          >
                            <span className="block font-medium">MCA Company Verification</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              Open official company and director verification resources.
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                "https://www.indiacode.nic.in",
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/10"
                          >
                            <span className="block font-medium">India Code Legislation</span>
                            <span className="mt-1 block text-xs text-muted-foreground">
                              Access central statutory language and legal references.
                            </span>
                          </button>
                        </div>
                        <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-foreground">
                          <p className="font-medium">Registry utility layer</p>
                          <p className="mt-2 text-muted-foreground">
                            The legal workspace keeps both official registry access points available
                            alongside the creator-facing drafting tools.
                          </p>
                        </div>
                      </div>
                    ) : activeLegalTab === "ecourts" ? (
                      <div className="space-y-3">
                        <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-foreground">
                          <p className="font-medium">e-Courts Case Tracker</p>
                          <p className="mt-2 text-muted-foreground">
                            A practical case filing framework for monitoring submissions, hearing
                            status, and escalation windows.
                          </p>
                        </div>
                        <div className="grid gap-2">
                          {[
                            {
                              id: "C-2041",
                              label: "Case filing submitted",
                              status: "Filed • 07/18/2026",
                            },
                            {
                              id: "C-2047",
                              label: "Hearing request queued",
                              status: "Pending review • 07/22/2026",
                            },
                            {
                              id: "C-2053",
                              label: "Notice response drafted",
                              status: "Ready for dispatch",
                            },
                          ].map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-sm text-foreground"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-medium">{item.id}</span>
                                <span className="text-xs text-muted-foreground">{item.status}</span>
                              </div>
                              <p className="mt-2 text-xs text-muted-foreground">{item.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : activeLegalTab === "notice" ? (
                      <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/60 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                          <label className="space-y-2 text-sm text-foreground">
                            <span>Founder / Entity Name</span>
                            <input
                              value={legalName}
                              onChange={(event) => setLegalName(event.target.value)}
                              className="w-full rounded-xl border border-primary/20 bg-background/70 px-3 py-2 text-sm text-foreground outline-none"
                              placeholder="Enter name"
                            />
                          </label>
                          <label className="space-y-2 text-sm text-foreground">
                            <span>Outstanding Amount</span>
                            <input
                              value={legalAmount}
                              onChange={(event) => setLegalAmount(event.target.value)}
                              className="w-full rounded-xl border border-primary/20 bg-background/70 px-3 py-2 text-sm text-foreground outline-none"
                              placeholder="Enter amount"
                            />
                          </label>
                        </div>
                        <label className="space-y-2 text-sm text-foreground">
                          <span>Describe the legal matter</span>
                          <textarea
                            value={legalPhrase}
                            onChange={(event) => setLegalPhrase(event.target.value)}
                            className="min-h-24 w-full rounded-2xl border border-primary/20 bg-background/70 p-3 text-sm text-foreground outline-none"
                            placeholder="Describe the issue you want to reference"
                          />
                        </label>
                        <Button
                          onClick={() => {
                            const notice = `FORMAL LEGAL NOTICE\n\nTo ${legalName || "the recipient"}, this notice is issued for an outstanding amount of INR ${legalAmount || "0"}.\n\nThe relevant legal matter described by the creator is: ${legalPhrase || "legal issue"}.\n\nPlease respond within seven days to avoid escalation through formal legal proceedings.`;
                            setLegalNotice(notice);
                          }}
                        >
                          Generate Notice Preview
                        </Button>
                        {legalNotice && (
                          <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-sm leading-7 text-foreground">
                            <p className="font-medium">Preview</p>
                            <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] text-muted-foreground">
                              {legalNotice}
                            </pre>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/60 p-4">
                        <p className="text-sm font-medium text-foreground">
                          Compliance Checklist Builder
                        </p>
                        <div className="grid gap-2">
                          {Object.entries(complianceChecks).map(([item, checked]) => (
                            <label
                              key={item}
                              className="flex items-center gap-3 rounded-xl border border-primary/10 bg-background/70 px-3 py-2 text-sm text-foreground"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setComplianceChecks((prev) => ({ ...prev, [item]: !prev[item] }))
                                }
                                className="h-4 w-4 rounded border-primary/40 bg-transparent"
                              />
                              <span>{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 rounded-2xl border border-primary/15 bg-background/60 p-4">
                      <p className="text-sm font-medium text-foreground">
                        Pre-loaded Government Registry Links
                      </p>
                      <div className="grid gap-2">
                        {legalMatches.length > 0 ? (
                          legalMatches.map((match) => (
                            <button
                              key={match.label}
                              type="button"
                              onClick={() =>
                                window.open(match.url, "_blank", "noopener,noreferrer")
                              }
                              className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-left text-sm text-foreground transition hover:border-primary/40 hover:bg-primary/10"
                            >
                              <span className="block font-medium">{match.label}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {match.reason}
                              </span>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Type a phrase with company, compliance, statute, notice, or trademark
                            language to see matching registry links appear here.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : activeModule.kind === "media" ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-primary/15 bg-background/60 p-4 text-sm text-foreground">
                      <p className="font-medium text-foreground">AI Content Pipeline</p>
                      <p className="mt-2 text-muted-foreground">
                        The creator workspace now blends teleprompting, audio-driven overlays, and
                        cinematic rendering in one futuristic flow.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { id: "teleprompter", label: "AI Teleprompter Studio" },
                          { id: "analyst", label: "Pyramid AI Analyst Console" },
                          { id: "editor", label: "Cinematic Auto-Editor" },
                        ] as Array<{ id: "teleprompter" | "analyst" | "editor"; label: string }>
                      ).map((tab) => {
                        const isActive = activeMediaTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveMediaTab(tab.id)}
                            className={`rounded-full border px-3 py-1.5 text-sm transition ${isActive ? "border-primary/40 bg-primary/10 text-foreground" : "border-primary/15 bg-background/60 text-muted-foreground"}`}
                          >
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    {activeMediaTab === "teleprompter" ? (
                      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/60 p-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">
                              AI Script Generator
                            </p>
                            <p className="text-sm text-muted-foreground">
                              The prompt is auto-synced with the latest research feed so the creator
                              can speak in Hindi and English without breaking flow.
                            </p>
                          </div>
                          <textarea
                            value={scriptInput}
                            onChange={(event) => setScriptInput(event.target.value)}
                            className="min-h-24 w-full rounded-2xl border border-primary/20 bg-background/70 p-3 text-sm text-foreground outline-none"
                            placeholder="Compose your teleprompter script"
                          />
                          <div className="overflow-hidden rounded-2xl border border-primary/15 bg-primary/10 p-3 text-sm text-foreground">
                            <p className="text-[11px] uppercase tracking-[0.25em] text-primary/70">
                              Live script stream
                            </p>
                            <div className="mt-2 overflow-hidden">
                              <div className="whitespace-nowrap text-sm text-muted-foreground animate-[marquee_18s_linear_infinite]">
                                {newsFeed[0]?.headline || "Live briefing ready"} | नई जानकारी:{" "}
                                {scriptInput || "सीक्रिप्ट तैयार"} | English cue:{" "}
                                {scriptInput || "Script ready"}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/60 p-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Camera View</p>
                            <p className="text-sm text-muted-foreground">
                              Futuristic capture controls prepare the shot for high-impact creator
                              delivery.
                            </p>
                          </div>
                          <div className="rounded-[24px] border border-primary/20 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_60%),rgba(2,6,23,0.95)] p-4">
                            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                              <span>Live Frame</span>
                              <span>{isRecording ? "Recording" : "Standby"}</span>
                            </div>
                            <div
                              className={`mt-4 rounded-[20px] border border-primary/20 bg-background/70 p-4 ${isRecording ? "animate-pulse" : ""}`}
                            >
                              <div className="flex flex-wrap gap-2">
                                {["Enhance Filter", "Cinematic Tone", "Auto Light"].map(
                                  (option) => (
                                    <span
                                      key={option}
                                      className="rounded-full border border-primary/15 bg-primary/10 px-3 py-1 text-xs text-foreground"
                                    >
                                      {option}
                                    </span>
                                  ),
                                )}
                              </div>
                              <div className="mt-4 flex items-center justify-between rounded-2xl border border-primary/15 bg-background/60 p-3">
                                <span className="text-sm text-foreground">
                                  AI creator take ready
                                </span>
                                <Button
                                  onClick={() => setIsRecording((prev) => !prev)}
                                  className={`rounded-full px-4 ${isRecording ? "bg-red-500/90 text-white" : "bg-primary/90 text-primary-foreground"}`}
                                >
                                  {isRecording ? "Stop Recording" : "Start Recording"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeMediaTab === "analyst" ? (
                      <div className="space-y-3 rounded-2xl border border-primary/15 bg-background/60 p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Pyramid AI Analyst Console
                          </p>
                          <p className="text-sm text-muted-foreground">
                            The system listens to the transcript and triggers visual overlays in
                            real time based on audio tags.
                          </p>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              time: "00:12",
                              audio: "Mumbai to Delhi",
                              trigger: "Generating 3D Map Overlay",
                              progress: 72,
                            },
                            {
                              time: "00:38",
                              audio: "Section 420 Scam",
                              trigger: "Fetching Government Gazette / MCA document from Database",
                              progress: 92,
                            },
                          ].map((item) => (
                            <div
                              key={item.audio}
                              className="rounded-2xl border border-primary/15 bg-background/70 p-3 text-sm text-foreground"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-[11px] uppercase tracking-[0.25em] text-primary/70">
                                  {item.time}
                                </span>
                                <span className="text-xs text-muted-foreground">{item.audio}</span>
                              </div>
                              <p className="mt-2 font-medium">{item.trigger}</p>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-background/60">
                                <div
                                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-primary"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 rounded-2xl border border-primary/15 bg-background/60 p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">
                            Cinematic Auto-Editor
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Images, text highlights, and legal article references are layered onto
                            the timeline automatically.
                          </p>
                        </div>
                        <div className="rounded-2xl border border-primary/15 bg-background/70 p-3">
                          <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                            <span>Timeline</span>
                            <span>{renderProgress}%</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            {[
                              { label: "Intro frame", color: "bg-cyan-500/80" },
                              { label: "Red highlight overlay", color: "bg-red-500/80" },
                              { label: "Legal article layer", color: "bg-slate-800" },
                            ].map((layer) => (
                              <div
                                key={layer.label}
                                className="rounded-xl border border-primary/10 bg-background/60 p-2 text-sm text-foreground"
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`h-2.5 w-2.5 rounded-full ${layer.color}`} />
                                  <span>{layer.label}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-primary to-fuchsia-500 transition-all duration-300"
                              style={{ width: `${renderProgress}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <Button
                            onClick={() => {
                              setRenderProgress(0);
                              setIsRendering(true);
                            }}
                          >
                            Start Render
                          </Button>
                          <Button variant="outline" onClick={() => setIsRendering(false)}>
                            Pause
                          </Button>
                        </div>
                        <div className="rounded-2xl border border-primary/15 bg-primary/10 p-3 text-sm text-foreground">
                          <p className="font-medium">Render status</p>
                          <p className="mt-1 text-muted-foreground">
                            {isRendering
                              ? "Rendering pipeline is active"
                              : renderProgress === 100
                                ? "Render complete"
                                : "Ready to render"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => setActiveModule(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {activeModule.bullets?.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-primary/15 bg-background/60 p-3 text-sm text-foreground"
                        >
                          {item}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        onClick={() => {
                          setActiveModule(null);
                          window.alert(`Launching ${activeModule.title} workspace...`);
                        }}
                      >
                        Launch workspace
                      </Button>
                      <Button variant="outline" onClick={() => setActiveModule(null)}>
                        Close
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <AiProcessingOverlay
        isOpen={aiProcessingOpen}
        onComplete={handleAiProcessingComplete}
        title={pendingScriptTitle}
        description={pendingScriptDesc}
      />
    </div>
  );
}
