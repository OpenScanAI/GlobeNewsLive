"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";

// Error Boundary for client-side crashes
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}
class DashboardErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Dashboard Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center bg-[#0a0a0f] text-white">
          <div className="text-center p-8 bg-[#12121a] rounded-lg border border-red-500/30">
            <div className="text-red-400 text-xl mb-2">⚠️ Dashboard Error</div>
            <div className="text-gray-400 text-sm mb-4">
              {this.state.error?.message || "Something went wrong"}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00ff88]/20 text-[#00ff88] rounded hover:bg-[#00ff88]/30"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout item type (matching react-grid-layout's Layout interface)
interface Layout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
}
import {
  Settings,
  LayoutGrid,
  Save,
  FolderOpen,
  Download,
  Upload,
  RotateCcw,
  ChevronDown,
  Plus,
  Check,
  Trash2,
} from "lucide-react";

// Components
import SignalFeed from "./SignalFeed";
import WorldMap from "./WorldMap";
import RiskDashboard from "./RiskDashboard";
import SentimentMeter from "./SentimentMeter";
import FlightRadar from "./FlightRadar";
import MilitaryTracker from "./MilitaryTracker";
import CyberFeed from "./CyberFeed";
import TwitterFeed from "./TwitterFeed";
import HotspotStreams from "./HotspotStreams";
import AttackTimeline from "./AttackTimeline";
import AIInsights from "./AIInsights";
import MarketTicker from "./MarketTicker";
import MultiPredictions from "./MultiPredictions";
import CountryRiskPanel from "./CountryRiskPanel";

import WidgetSelector, {
  WidgetConfig,
  WIDGET_REGISTRY,
} from "./WidgetSelector";
import SettingsModal, {
  DashboardSettings,
  DEFAULT_SETTINGS,
} from "./SettingsModal";
import ClimateAnomalyPanel from "./ClimateAnomalyPanel";
import DisplacementPanel from "./DisplacementPanel";
import GulfEconomiesPanel from "./GulfEconomiesPanel";
import SatelliteFiresPanel from "./SatelliteFiresPanel";
import TelegramFeed from "./TelegramFeed";
import PlaybackControl from "./PlaybackControl";
import CIIPanel from "./CIIPanel";
import OrefSirensPanel from "./OrefSirensPanel";
import StrategicPosturePanel from "./StrategicPosturePanel";
import UcdpEventsPanel from "./UcdpEventsPanel";
import WorldClockPanel from "./WorldClockPanel";
import SecurityAdvisoriesPanel from "./SecurityAdvisoriesPanel";
import SupplyChainPanel from "./SupplyChainPanel";
import PopulationExposurePanel from "./PopulationExposurePanel";
import GdeltIntelPanel from "./GdeltIntelPanel";
import MacroSignalsPanel from "./MacroSignalsPanel";
import DeductionPanel from "./DeductionPanel";
import CountryDeepDivePanel from "./CountryDeepDivePanel";
import EconomicPanel from "./EconomicPanel";
import StrategicRiskPanel from "./StrategicRiskPanel";
import ETFFlowsPanel from "./ETFFlowsPanel";
import StablecoinPanel from "./StablecoinPanel";
import TradePolicyPanel from "./TradePolicyPanel";
import IntelligenceGapBadge from "./IntelligenceGapBadge";
import SignalModalPanel from "./SignalModalPanel";
import CountryTimelinePanel from "./CountryTimelinePanel";

import { Signal, MarketData } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedLayout {
  name: string;
  layout: Layout[];
  visibleWidgets: string[];
  createdAt: number;
}

interface CustomDashboardProps {
  signals: Signal[];
  markets: MarketData[];
  earthquakes: any[];
  conflicts: any[];
  signalsLoading?: boolean;
  marketsLoading?: boolean;
  activeLayers: string[];
  onLayerToggle: (layer: string) => void;
  onSignalClick: (signal: Signal) => void;
}

// ─── Layout Presets ───────────────────────────────────────────────────────────

const LAYOUT_PRESETS: Record<
  string,
  {
    label: string;
    emoji: string;
    desc: string;
    layout: Layout[];
    widgets: string[];
  }
> = {
  "intelligence-analyst": {
    label: "Intelligence Analyst",
    emoji: "🕵️",
    desc: "Map + Videos + Risk + Timeline + Flight Radar + Panels",
    widgets: [
      "signal-feed",
      "world-map",
      "hotspot-streams",
      "risk-dashboard",
      "sentiment-meter",
      "ai-insights",
      "attack-timeline",
      "flight-radar",
    ],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 10, minW: 1, maxW: 1, minH: 6 },
      { i: "world-map", x: 0, y: 0, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
      {
        i: "hotspot-streams",
        x: 1,
        y: 0,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      {
        i: "risk-dashboard",
        x: 0,
        y: 6,
        w: 1,
        h: 5,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "sentiment-meter",
        x: 1,
        y: 6,
        w: 1,
        h: 5,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      { i: "ai-insights", x: 0, y: 11, w: 1, h: 5, minW: 1, maxW: 1, minH: 3 },
      {
        i: "attack-timeline",
        x: 1,
        y: 11,
        w: 1,
        h: 5,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "flight-radar",
        x: 1,
        y: 16,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
    ],
  },
  trader: {
    label: "Trader",
    emoji: "📈",
    desc: "Markets + Sentiment + Predictions + News",
    widgets: [
      "signal-feed",
      "market-ticker",
      "sentiment-meter",
      "multi-predictions",
      "ai-insights",
      "twitter-feed",
      "cyber-feed",
    ],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 12, minW: 1, maxW: 1, minH: 6 },
      { i: "market-ticker", x: 0, y: 0, w: 1, h: 5, minW: 1, maxW: 1, minH: 3 },
      {
        i: "sentiment-meter",
        x: 1,
        y: 0,
        w: 1,
        h: 5,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "multi-predictions",
        x: 0,
        y: 5,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      { i: "ai-insights", x: 1, y: 5, w: 1, h: 4, minW: 1, maxW: 1, minH: 3 },
      { i: "twitter-feed", x: 0, y: 11, w: 1, h: 5, minW: 1, maxW: 1, minH: 4 },
      { i: "cyber-feed", x: 1, y: 9, w: 1, h: 7, minW: 1, maxW: 1, minH: 4 },
    ],
  },
  "regional-focus": {
    label: "Regional Focus",
    emoji: "🌍",
    desc: "Map + Country panels + Local news",
    widgets: [
      "world-map",
      "country-risk",
      "signal-feed",
      "attack-timeline",
      "military-tracker",
      "flight-radar",
    ],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 12, minW: 1, maxW: 1, minH: 6 },
      { i: "world-map", x: 0, y: 0, w: 1, h: 8, minW: 1, maxW: 1, minH: 5 },
      { i: "country-risk", x: 1, y: 0, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
      {
        i: "attack-timeline",
        x: 0,
        y: 8,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      {
        i: "military-tracker",
        x: 1,
        y: 6,
        w: 1,
        h: 8,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      { i: "flight-radar", x: 0, y: 14, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
    ],
  },
  minimal: {
    label: "Minimal",
    emoji: "🎯",
    desc: "Just signals + map",
    widgets: ["signal-feed", "world-map"],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 12, minW: 1, maxW: 1, minH: 6 },
      { i: "world-map", x: 0, y: 0, w: 2, h: 12, minW: 2, maxW: 2, minH: 6 },
    ],
  },
  "full-monitor": {
    label: "Full Monitor",
    emoji: "🖥️",
    desc: "All panels - Climate, Telegram, Gulf, Fires",
    widgets: [
      "signal-feed",
      "world-map",
      "hotspot-streams",
      "risk-dashboard",
      "climate-anomaly",
      "telegram-feed",
      "gulf-economies",
      "satellite-fires",
      "displacement",
      "attack-timeline",
    ],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 10, minW: 1, maxW: 1, minH: 6 },
      { i: "world-map", x: 0, y: 0, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
      {
        i: "hotspot-streams",
        x: 1,
        y: 0,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      {
        i: "risk-dashboard",
        x: 0,
        y: 6,
        w: 1,
        h: 4,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "climate-anomaly",
        x: 1,
        y: 6,
        w: 1,
        h: 4,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "telegram-feed",
        x: 0,
        y: 10,
        w: 1,
        h: 5,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      {
        i: "gulf-economies",
        x: 1,
        y: 10,
        w: 1,
        h: 4,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      {
        i: "satellite-fires",
        x: 0,
        y: 15,
        w: 1,
        h: 4,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
      { i: "displacement", x: 1, y: 14, w: 1, h: 4, minW: 1, maxW: 1, minH: 3 },
      {
        i: "attack-timeline",
        x: 0,
        y: 19,
        w: 1,
        h: 4,
        minW: 1,
        maxW: 1,
        minH: 3,
      },
    ],
  },
  "complete-monitor": {
    label: "Complete Monitor",
    emoji: "🌐",
    desc: "ALL panels — Comprehensive coverage",
    widgets: [
      "signal-feed",
      "world-map",
      "hotspot-streams",
      "cii-panel",
      "oref-sirens",
      "strategic-posture",
      "ucdp-events",
      "world-clock",
      "security-advisories",
      "supply-chain",
      "population-exposure",
      "gdelt-intel",
      "macro-signals",
      "deduction-panel",
      "country-deep-dive",
      "economic-panel",
      "strategic-risk",
    ],
    layout: [
      { i: "signal-feed", x: 0, y: 0, w: 1, h: 12, minW: 1, maxW: 1, minH: 6 },
      { i: "world-map", x: 0, y: 0, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
      {
        i: "hotspot-streams",
        x: 1,
        y: 0,
        w: 1,
        h: 6,
        minW: 1,
        maxW: 1,
        minH: 4,
      },
      { i: "world-clock", x: 0, y: 6, w: 1, h: 6, minW: 1, maxW: 1, minH: 4 },
      { i: "cii-panel", x: 1, y: 6, w: 1, h: 8, minW: 1, maxW: 1, minH: 6 },
      {
        i: "strategic-posture",
        x: 0,
        y: 12,
        w: 1,
        h: 8,
        minW: 1,
        maxW: 1,
        minH: 6,
      },
      { i: "oref-sirens", x: 1, y: 14, w: 1, h: 8, minW: 1, maxW: 1, minH: 6 },
      { i: "ucdp-events", x: 0, y: 20, w: 1, h: 8, minW: 1, maxW: 1, minH: 6 },
      { i: "gdelt-intel", x: 1, y: 22, w: 1, h: 8, minW: 1, maxW: 1, minH: 6 },
      {
        i: "macro-signals",
        x: 0,
        y: 28,
        w: 1,
        h: 8,
        minW: 1,
        maxW: 1,
        minH: 6,
      },
      { i: "supply-chain", x: 1, y: 30, w: 1, h: 8, minW: 1, maxW: 1, minH: 6 },
      {
        i: "security-advisories",
        x: 0,
        y: 36,
        w: 1,
        h: 8,
        minW: 1,
        maxW: 1,
        minH: 6,
      },
      {
        i: "population-exposure",
        x: 1,
        y: 38,
        w: 1,
        h: 8,
        minW: 1,
        maxW: 1,
        minH: 6,
      },
      {
        i: "deduction-panel",
        x: 0,
        y: 44,
        w: 1,
        h: 10,
        minW: 1,
        maxW: 1,
        minH: 8,
      },
      {
        i: "country-deep-dive",
        x: 1,
        y: 46,
        w: 1,
        h: 10,
        minW: 1,
        maxW: 1,
        minH: 8,
      },
      {
        i: "economic-panel",
        x: 0,
        y: 54,
        w: 1,
        h: 10,
        minW: 1,
        maxW: 1,
        minH: 8,
      },
      {
        i: "strategic-risk",
        x: 1,
        y: 56,
        w: 1,
        h: 10,
        minW: 1,
        maxW: 1,
        minH: 8,
      },
    ],
  },
};

// ─── LocalStorage Keys ────────────────────────────────────────────────────────

const LS_LAYOUT = "globenews_layout";
const LS_VISIBLE = "globenews_visible";
const LS_SETTINGS = "globenews_settings";
const LS_SAVED = "globenews_saved_layouts";
const LS_CURRENT = "globenews_current_preset";
const LS_VERSION = "globenews_version";
const CURRENT_VERSION = "3.1.0"; // Bump this to reset layouts

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomDashboard({
  signals,
  markets,
  earthquakes,
  conflicts,
  signalsLoading,
  marketsLoading,
  activeLayers,
  onLayerToggle,
  onSignalClick,
}: CustomDashboardProps) {
  const [layout, setLayout] = useState<Layout[]>(
    LAYOUT_PRESETS["intelligence-analyst"].layout,
  );
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    LAYOUT_PRESETS["intelligence-analyst"].widgets,
  );
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, SavedLayout>>(
    {},
  );
  const [currentPreset, setCurrentPreset] = useState<string>(
    "intelligence-analyst",
  );

  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedMenu, setShowSavedMenu] = useState(false);
  const [saveLayoutName, setSaveLayoutName] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const presetsRef = useRef<HTMLDivElement>(null);
  const savedMenuRef = useRef<HTMLDivElement>(null);

  // ── Hydrate from localStorage ───────────────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
    try {
      // Check version - clear old layouts if version changed
      const storedVersion = localStorage.getItem(LS_VERSION);
      if (storedVersion !== CURRENT_VERSION) {
        console.log("[GlobeNews] Version changed, resetting layouts");
        localStorage.removeItem(LS_LAYOUT);
        localStorage.removeItem(LS_VISIBLE);
        localStorage.removeItem(LS_CURRENT);
        localStorage.setItem(LS_VERSION, CURRENT_VERSION);
        // Use defaults - don't load from storage
        return;
      }

      const storedLayout = localStorage.getItem(LS_LAYOUT);
      const storedVisible = localStorage.getItem(LS_VISIBLE);
      const storedSettings = localStorage.getItem(LS_SETTINGS);
      const storedSaved = localStorage.getItem(LS_SAVED);
      const storedPreset = localStorage.getItem(LS_CURRENT);

      if (storedLayout) setLayout(JSON.parse(storedLayout));
      if (storedVisible) setVisibleWidgets(JSON.parse(storedVisible));
      if (storedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      if (storedSaved) setSavedLayouts(JSON.parse(storedSaved));
      if (storedPreset) setCurrentPreset(storedPreset);
    } catch {}
  }, []);

  // ── Persist layout & visible ────────────────────────────────────────────────
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(LS_LAYOUT, JSON.stringify(layout));
  }, [layout, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(LS_VISIBLE, JSON.stringify(visibleWidgets));
  }, [visibleWidgets, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem(LS_SETTINGS, JSON.stringify(settings));
  }, [settings, isMounted]);

  // ── Apply preset ────────────────────────────────────────────────────────────
  const applyPreset = useCallback((presetKey: string) => {
    const preset = LAYOUT_PRESETS[presetKey];
    if (!preset) return;
    setLayout(preset.layout);
    setVisibleWidgets(preset.widgets);
    setCurrentPreset(presetKey);
    localStorage.setItem(LS_CURRENT, presetKey);
    setShowPresetsMenu(false);
  }, []);

  // ── Save current layout ─────────────────────────────────────────────────────
  const saveCurrentLayout = useCallback(() => {
    if (!saveLayoutName.trim()) return;
    const newSaved: SavedLayout = {
      name: saveLayoutName.trim(),
      layout,
      visibleWidgets,
      createdAt: Date.now(),
    };
    const updated = { ...savedLayouts, [saveLayoutName.trim()]: newSaved };
    setSavedLayouts(updated);
    localStorage.setItem(LS_SAVED, JSON.stringify(updated));
    setSaveLayoutName("");
    setShowSaveDialog(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  }, [saveLayoutName, layout, visibleWidgets, savedLayouts]);

  // ── Load saved layout ───────────────────────────────────────────────────────
  const loadSavedLayout = useCallback(
    (name: string) => {
      const saved = savedLayouts[name];
      if (!saved) return;
      setLayout(saved.layout);
      setVisibleWidgets(saved.visibleWidgets);
      setCurrentPreset("custom");
      setShowSavedMenu(false);
    },
    [savedLayouts],
  );

  // ── Delete saved layout ─────────────────────────────────────────────────────
  const deleteSavedLayout = useCallback(
    (name: string) => {
      const updated = { ...savedLayouts };
      delete updated[name];
      setSavedLayouts(updated);
      localStorage.setItem(LS_SAVED, JSON.stringify(updated));
    },
    [savedLayouts],
  );

  // ── Export layout ───────────────────────────────────────────────────────────
  const exportLayout = useCallback(() => {
    const data = {
      layout,
      visibleWidgets,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `globenews-dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [layout, visibleWidgets, settings]);

  // ── Import layout ───────────────────────────────────────────────────────────
  const importLayout = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.layout) setLayout(data.layout);
          if (data.visibleWidgets) setVisibleWidgets(data.visibleWidgets);
          if (data.settings)
            setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

  // ── Widget visibility ───────────────────────────────────────────────────────
  const toggleWidget = useCallback(
    (id: string) => {
      setVisibleWidgets((prev) => {
        if (prev.includes(id)) {
          return prev.filter((w) => w !== id);
        } else {
          // Add with default layout position (2-column grid)
          const reg = WIDGET_REGISTRY.find((w) => w.id === id);
          if (reg) {
            // Calculate position: alternate between left (x=0) and right (x=1)
            const existingWidgets = layout.filter((l) => l.i !== "signal-feed");
            const maxY = existingWidgets.reduce(
              (max, l) => Math.max(max, l.y + l.h),
              0,
            );
            const lastWidget = existingWidgets[existingWidgets.length - 1];
            const nextX = lastWidget && lastWidget.x === 0 ? 1 : 0;
            const nextY = nextX === 1 && lastWidget ? lastWidget.y : maxY;

            setLayout((prev) => [
              ...prev,
              {
                i: id,
                x: nextX,
                y: nextY,
                w: 1, // Half width in 2-column grid
                h: 5, // Default height
                minW: 1,
                maxW: 1, // Prevent expansion
                minH: 3,
              },
            ]);
          }
          return [...prev, id];
        }
      });
    },
    [layout],
  );

  const addWidget = useCallback((id: string) => {
    // Widget is added in toggleWidget; this is just for the selector button
  }, []);

  // ── Widget configs ──────────────────────────────────────────────────────────
  const widgetConfigs: WidgetConfig[] = WIDGET_REGISTRY.map((w) => ({
    ...w,
    visible: visibleWidgets.includes(w.id),
  }));

  // ── Render individual widget content ────────────────────────────────────────
  const renderWidgetContent = (id: string) => {
    switch (id) {
      case "signal-feed":
        return (
          <SignalFeed
            signals={signals}
            loading={signalsLoading}
            onSignalClick={onSignalClick}
          />
        );
      case "world-map":
        return (
          <WorldMap
            signals={signals}
            activeLayers={activeLayers}
            onLayerToggle={onLayerToggle}
            earthquakes={earthquakes}
          />
        );
      case "risk-dashboard":
        return <RiskDashboard />;
      case "sentiment-meter":
        return <SentimentMeter />;
      case "flight-radar":
        return <FlightRadar />;
      case "military-tracker":
        return <MilitaryTracker />;
      case "cyber-feed":
        return <CyberFeed />;
      case "twitter-feed":
        return <TwitterFeed />;
      case "hotspot-streams":
        return <HotspotStreams />;
      case "attack-timeline":
        return <AttackTimeline />;
      case "ai-insights":
        return <AIInsights />;
      case "market-ticker":
        return <MarketTicker markets={markets} loading={marketsLoading} />;
      case "multi-predictions":
        return <MultiPredictions />;
      case "country-risk":
        return <CountryRiskPanel />;
      case "climate-anomaly":
        return <ClimateAnomalyPanel />;
      case "displacement":
        return <DisplacementPanel />;
      case "gulf-economies":
        return <GulfEconomiesPanel />;
      case "satellite-fires":
        return <SatelliteFiresPanel />;
      case "telegram-feed":
        return <TelegramFeed />;
      case "playback-control":
        return (
          <div className="flex items-center justify-center h-full p-2">
            <PlaybackControl />
          </div>
        );
      case "cii-panel":
        return <CIIPanel />;
      case "oref-sirens":
        return <OrefSirensPanel />;
      case "strategic-posture":
        return <StrategicPosturePanel />;
      case "ucdp-events":
        return <UcdpEventsPanel />;
      case "world-clock":
        return <WorldClockPanel />;
      case "security-advisories":
        return <SecurityAdvisoriesPanel />;
      case "supply-chain":
        return <SupplyChainPanel />;
      case "population-exposure":
        return <PopulationExposurePanel />;
      case "gdelt-intel":
        return <GdeltIntelPanel />;
      case "macro-signals":
        return <MacroSignalsPanel />;
      case "deduction-panel":
        return <DeductionPanel />;
      case "country-deep-dive":
        return <CountryDeepDivePanel />;
      case "economic-panel":
        return <EconomicPanel />;
      case "strategic-risk":
        return <StrategicRiskPanel />;
      case "etf-flows":
        return <ETFFlowsPanel />;
      case "stablecoin-panel":
        return <StablecoinPanel />;
      case "trade-policy":
        return <TradePolicyPanel />;
      case "intelligence-gaps":
        return <IntelligenceGapBadge />;
      case "signal-detail":
        return <SignalModalPanel />;
      case "country-timeline":
        return <CountryTimelinePanel />;
      default:
        return (
          <div className="flex items-center justify-center h-full text-white/20 text-xs font-mono">
            Unknown widget: {id}
          </div>
        );
    }
  };

  // ── Get widget meta ─────────────────────────────────────────────────────────
  const getWidgetMeta = (id: string) =>
    WIDGET_REGISTRY.find((w) => w.id === id);

  // ── Filter layout to visible widgets only ───────────────────────────────────
  const activeLayout = layout.filter((l) => visibleWidgets.includes(l.i));

  // ── Close dropdowns on outside click ───────────────────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        presetsRef.current &&
        !presetsRef.current.contains(e.target as Node)
      ) {
        setShowPresetsMenu(false);
      }
      if (
        savedMenuRef.current &&
        !savedMenuRef.current.contains(e.target as Node)
      ) {
        setShowSavedMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const currentPresetMeta = LAYOUT_PRESETS[currentPreset];

  // Separate signal-feed from other widgets
  const showSignalFeed = visibleWidgets.includes("signal-feed");
  const otherVisibleWidgets = visibleWidgets.filter((w) => w !== "signal-feed");
  const otherActiveLayout = layout.filter((l) => l.i !== "signal-feed");

  return (
    <DashboardErrorBoundary>
      <div
        className={`flex h-full w-full ${settings.theme === "light" ? "light-theme" : ""}`}
        style={{
          background: settings.theme === "light" ? "#f0f4f8" : undefined,
        }}
      >
        {/* ── LEFT SIDEBAR: SIGNAL FEED ─────────────────────────────── */}
        {showSignalFeed && (
          <div
            className="flex flex-col flex-shrink-0 border-r overflow-hidden"
            style={{
              width: "480px",
              minWidth: "480px",
              maxWidth: "480px",
              borderColor:
                settings.theme === "light"
                  ? "rgba(0,0,0,0.1)"
                  : "rgba(255,255,255,0.08)",
              background: settings.theme === "light" ? "#f0f4f8" : "#0a0a0f",
            }}
          >
            {/* Sidebar Header */}
            <div
              className="px-3 py-2 border-b flex-shrink-0"
              style={{
                borderColor:
                  settings.theme === "light"
                    ? "rgba(0,0,0,0.1)"
                    : "rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono font-semibold uppercase"
                  style={{
                    color:
                      settings.theme === "light"
                        ? "#374151"
                        : "rgba(255,255,255,0.6)",
                  }}
                >
                  📡 Signal Feed
                </span>
                <button
                  onClick={() => toggleWidget("signal-feed")}
                  className="text-white/20 hover:text-white/60 transition-colors"
                  title="Hide signal feed"
                >
                  ×
                </button>
              </div>
            </div>
            {/* Sidebar Content */}
            <div className="flex-1 overflow-hidden">
              {renderWidgetContent("signal-feed")}
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT AREA ─────────────────────────────── */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Toolbar */}
          <div
            className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0 z-20"
            style={{
              background: settings.theme === "light" ? "#e8ecf0" : "#0a0a0f",
              borderColor:
                settings.theme === "light"
                  ? "rgba(0,0,0,0.1)"
                  : "rgba(255,255,255,0.08)",
            }}
          >
            {/* Layout Presets Dropdown */}
            <div className="relative" ref={presetsRef}>
              <button
                onClick={() => setShowPresetsMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
                style={{
                  background: "rgba(0,255,136,0.08)",
                  borderColor: "rgba(0,255,136,0.25)",
                  color: "#00ff88",
                }}
              >
                <LayoutGrid size={11} />
                <span>
                  {currentPresetMeta?.emoji}{" "}
                  {currentPresetMeta?.label || "Custom"}
                </span>
                <ChevronDown
                  size={10}
                  className={`transition-transform ${showPresetsMenu ? "rotate-180" : ""}`}
                />
              </button>

              {showPresetsMenu && (
                <div
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl border shadow-2xl z-50 py-1 overflow-hidden"
                  style={{
                    background: "#0a0a0f",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="px-3 py-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <span
                      className="text-[9px] font-mono"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      LAYOUT PRESETS
                    </span>
                  </div>
                  {Object.entries(LAYOUT_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key)}
                      className="w-full flex items-start gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/5"
                    >
                      <span className="text-base mt-0.5">{preset.emoji}</span>
                      <div>
                        <div
                          className={`text-[11px] font-mono font-medium ${currentPreset === key ? "text-[#00ff88]" : "text-white"}`}
                        >
                          {preset.label}
                          {currentPreset === key && (
                            <span className="ml-2 text-[9px] opacity-70">
                              ●
                            </span>
                          )}
                        </div>
                        <div
                          className="text-[9px] mt-0.5"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                        >
                          {preset.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Save Layout */}
            <div className="relative">
              <button
                onClick={() => setShowSaveDialog((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
                style={{
                  background: saveSuccess
                    ? "rgba(0,255,136,0.15)"
                    : "rgba(255,255,255,0.05)",
                  borderColor: saveSuccess
                    ? "rgba(0,255,136,0.4)"
                    : "rgba(255,255,255,0.1)",
                  color: saveSuccess ? "#00ff88" : "rgba(255,255,255,0.5)",
                }}
                title="Save current layout"
              >
                {saveSuccess ? <Check size={11} /> : <Save size={11} />}
                <span className="hidden sm:inline">
                  {saveSuccess ? "Saved!" : "Save"}
                </span>
              </button>
              {showSaveDialog && (
                <div
                  className="absolute top-full left-0 mt-1 w-56 rounded-xl border shadow-2xl z-50 p-3"
                  style={{
                    background: "#0a0a0f",
                    borderColor: "rgba(255,255,255,0.1)",
                  }}
                >
                  <div
                    className="text-[9px] font-mono mb-2"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    SAVE AS
                  </div>
                  <input
                    value={saveLayoutName}
                    onChange={(e) => setSaveLayoutName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && saveCurrentLayout()}
                    placeholder="Layout name..."
                    className="w-full bg-white/5 border rounded px-2 py-1.5 text-[11px] font-mono text-white placeholder:text-white/20 outline-none mb-2"
                    style={{ borderColor: "rgba(255,255,255,0.1)" }}
                    autoFocus
                  />
                  <button
                    onClick={saveCurrentLayout}
                    disabled={!saveLayoutName.trim()}
                    className="w-full py-1.5 rounded text-[11px] font-mono transition-all disabled:opacity-30"
                    style={{
                      background: "rgba(0,255,136,0.15)",
                      color: "#00ff88",
                      border: "1px solid rgba(0,255,136,0.3)",
                    }}
                  >
                    Save Layout
                  </button>
                </div>
              )}
            </div>

            {/* Saved Layouts */}
            {Object.keys(savedLayouts).length > 0 && (
              <div className="relative" ref={savedMenuRef}>
                <button
                  onClick={() => setShowSavedMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                  }}
                  title="Load saved layout"
                >
                  <FolderOpen size={11} />
                  <span className="hidden sm:inline">Saved</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full font-mono"
                    style={{
                      background: "rgba(0,204,255,0.15)",
                      color: "#00ccff",
                    }}
                  >
                    {Object.keys(savedLayouts).length}
                  </span>
                </button>
                {showSavedMenu && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 rounded-xl border shadow-2xl z-50 py-1 overflow-hidden"
                    style={{
                      background: "#0a0a0f",
                      borderColor: "rgba(255,255,255,0.1)",
                    }}
                  >
                    {Object.entries(savedLayouts).map(([name, saved]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between px-3 py-2 hover:bg-white/5 group"
                      >
                        <button
                          onClick={() => loadSavedLayout(name)}
                          className="flex-1 text-left text-[11px] font-mono text-white/70 hover:text-white"
                        >
                          {name}
                        </button>
                        <button
                          onClick={() => deleteSavedLayout(name)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-400/60 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div className="w-px h-5 bg-white/10 hidden sm:block" />

            {/* Export / Import */}
            <button
              onClick={exportLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
              title="Export layout as JSON"
            >
              <Download size={11} />
            </button>
            <button
              onClick={importLayout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
              title="Import layout from JSON"
            >
              <Upload size={11} />
            </button>
            <button
              onClick={() => applyPreset("intelligence-analyst")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.35)",
              }}
              title="Reset to default layout"
            >
              <RotateCcw size={11} />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Widget Selector button */}
            <button
              onClick={() => setShowWidgetSelector((v) => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
              style={{
                background: showWidgetSelector
                  ? "rgba(0,204,255,0.1)"
                  : "rgba(255,255,255,0.05)",
                borderColor: showWidgetSelector
                  ? "rgba(0,204,255,0.3)"
                  : "rgba(255,255,255,0.1)",
                color: showWidgetSelector ? "#00ccff" : "rgba(255,255,255,0.5)",
              }}
              title="Add/remove widgets"
            >
              <Plus size={11} />
              <span className="hidden sm:inline">Widgets</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono border transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
              }}
              title="Dashboard settings"
            >
              <Settings size={11} />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>

          {/* ── Responsive Grid Layout ──────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto custom-scrollbar-wide">
            {isMounted && otherVisibleWidgets.length > 0 && (
              <div
                className="widget-grid-container p-3"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                  minHeight: "100%",
                  alignContent: "start",
                }}
              >
                {otherVisibleWidgets.map((widgetId) => {
                  const meta = getWidgetMeta(widgetId);
                  return (
                    <div
                      key={widgetId}
                      className="widget-panel flex flex-col rounded-lg overflow-hidden border group"
                      style={{
                        background:
                          settings.theme === "light" ? "#ffffff" : "#0f1218",
                        borderColor: "rgba(255,255,255,0.07)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        minHeight: "400px",
                      }}
                    >
                      {/* Widget Header */}
                      <div
                        className="flex items-center justify-between px-3 py-2 flex-shrink-0 border-b select-none"
                        style={{
                          background:
                            settings.theme === "light"
                              ? "#f8f9fa"
                              : "rgba(255,255,255,0.03)",
                          borderColor: "rgba(255,255,255,0.06)",
                          minHeight: "32px",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{meta?.icon}</span>
                          <span
                            className="text-[10px] font-mono font-semibold tracking-wider uppercase"
                            style={{
                              color:
                                settings.theme === "light"
                                  ? "#374151"
                                  : "rgba(255,255,255,0.6)",
                            }}
                          >
                            {meta?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWidget(widgetId)}
                            className="w-4 h-4 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity text-white/20 hover:text-white/60"
                            title="Hide widget"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      {/* Widget Content */}
                      <div className="flex-1 overflow-hidden min-h-0">
                        {renderWidgetContent(widgetId)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty state */}
            {isMounted && otherVisibleWidgets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
                <div className="text-5xl">📭</div>
                <div className="text-white/40 font-mono text-sm">
                  No widgets active
                </div>
                <button
                  onClick={() => setShowWidgetSelector(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono border transition-all"
                  style={{
                    background: "rgba(0,255,136,0.1)",
                    borderColor: "rgba(0,255,136,0.3)",
                    color: "#00ff88",
                  }}
                >
                  <Plus size={12} /> Add Widgets
                </button>
              </div>
            )}
          </div>
        </div>
        {/* ── Widget Selector Panel ─────────────────────────────────────── */}
        <WidgetSelector
          isOpen={showWidgetSelector}
          onClose={() => setShowWidgetSelector(false)}
          widgets={widgetConfigs}
          onToggleWidget={toggleWidget}
          onAddWidget={addWidget}
        />

        {/* ── Settings Modal ────────────────────────────────────────────── */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </div>
    </DashboardErrorBoundary>
  );
}
