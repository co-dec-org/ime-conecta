import { useCallback, useEffect, useMemo, useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import ContentSection from "./components/ContentSection";
import DownloadPanel from "./components/DownloadPanel";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import IndexSection from "./components/IndexSection";
import Layout from "./components/Layout";
import FloatingNotes from "./components/FloatingNotes";
import PresentationControls from "./components/PresentationControls";
import ProgressBar from "./components/ProgressBar";
import SearchPanel from "./components/SearchPanel";
import SectionNav from "./components/SectionNav";
import VideoLayer from "./components/VideoLayer";
import { executiveSummary, sections, type SectionContent } from "./data/content";
import { useActiveSection } from "./hooks/useActiveSection";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { usePresentationMode, type ViewMode } from "./hooks/usePresentationMode";
import { copyToClipboard } from "./utils/copy";
import { smoothScrollToElement } from "./utils/smoothScroll";

const getSectionSearchText = (section: SectionContent) =>
  [
    section.title,
    section.navLabel,
    section.eyebrow,
    section.subtitle,
    section.body,
    section.definition,
    section.highlight,
    section.bullets?.join(" "),
    section.cards?.join(" "),
    section.blocks?.join(" "),
    section.phrases?.join(" "),
    section.table?.columns.join(" "),
    section.table?.rows.flat().join(" "),
    section.comparison?.leftTitle,
    section.comparison?.rightTitle,
    section.comparison?.rows.flat().join(" "),
    section.flow?.join(" "),
    section.timeline
      ?.map((item) => `${item.label} ${item.items.join(" ")}`)
      .join(" "),
    section.questions?.join(" "),
    section.agreements?.join(" "),
    section.searchTags?.join(" "),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function App() {
  const sectionIds = useMemo(() => sections.map((section) => section.id), []);
  const activeId = useActiveSection(sectionIds);
  const {
    mode,
    setMode,
    currentIndex,
    goToIndex,
    next,
    previous,
  } = usePresentationMode(sectionIds, activeId);
  const [theme, setTheme] = useLocalStorage<"dark" | "light">(
    "ime-conecta-theme",
    "dark",
  );
  const [isRailOpen, setIsRailOpen] = useLocalStorage(
    "ime-conecta-rail-open",
    true,
  );
  const [query, setQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fullscreenMessage, setFullscreenMessage] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeId) ?? sections[0],
    [activeId],
  );

  const matches = useMemo(() => {
    if (!normalizedQuery) {
      return sections;
    }

    return sections.filter((section) =>
      getSectionSearchText(section).includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  const matchedIds = useMemo(
    () => new Set(matches.map((section) => section.id)),
    [matches],
  );

  const navigateTo = useCallback(
    (id: string) => {
      const index = sectionIds.indexOf(id);
      if (index >= 0) {
        goToIndex(index);
      }
    },
    [goToIndex, sectionIds],
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("is-rail-collapsed", !isRailOpen);
    return () => document.body.classList.remove("is-rail-collapsed");
  }, [isRailOpen]);

  useEffect(() => {
    if (mode === "presentation") {
      setIsRailOpen(false);
    }
  }, [mode, setIsRailOpen]);

  useEffect(() => {
    const syncFullscreenState = () => {
      document.body.classList.toggle(
        "is-fullscreen",
        Boolean(document.fullscreenElement),
      );
    };

    syncFullscreenState();
    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
      document.body.classList.remove("is-fullscreen");
    };
  }, []);

  useEffect(() => {
    const animatedElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );

    if (!animatedElements.length) {
      return undefined;
    }

    if (
      prefersReducedMotion() ||
      typeof window.IntersectionObserver === "undefined"
    ) {
      animatedElements.forEach((element) => {
        element.dataset.visible = "true";
      });
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.16,
      },
    );

    animatedElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      if (mode === "presentation") {
        setProgress(((currentIndex + 1) / sections.length) * 100);
        return;
      }

      const scrollTop = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0);
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, [currentIndex, mode]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!fullscreenMessage) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setFullscreenMessage(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [fullscreenMessage]);

  const handleCopySummary = async () => {
    try {
      await copyToClipboard(executiveSummary);
      setCopied(true);
    } catch {
      setFullscreenMessage("No fue posible copiar el resumen ejecutivo.");
    }
  };

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setFullscreenMessage("Pantalla completa activa.");
      } else {
        await document.exitFullscreen();
        setFullscreenMessage("Pantalla completa desactivada.");
      }
    } catch {
      setFullscreenMessage(
        "El navegador bloqueo la pantalla completa para esta accion.",
      );
    }
  };

  const handleModeChange = (nextMode: ViewMode) => {
    setMode(nextMode);
    if (nextMode === "presentation") {
      window.setTimeout(() => {
        smoothScrollToElement(document.getElementById(activeId));
      }, 0);
    }
  };

  const header = (
    <>
      <ProgressBar progress={progress} />
      <Header
        theme={theme}
        mode={mode}
        copied={copied}
        fullscreenMessage={fullscreenMessage}
        onThemeToggle={() => setTheme(theme === "dark" ? "light" : "dark")}
        onCopySummary={handleCopySummary}
        onModeChange={handleModeChange}
        onFullscreen={handleFullscreen}
      />
    </>
  );

  const rail = (
    <>
      <button
        type="button"
        className="rail-toggle"
        onClick={() => setIsRailOpen(!isRailOpen)}
        aria-expanded={isRailOpen}
        aria-controls="presentation-rail"
      >
        <span>{isRailOpen ? "<<" : ">>"}</span>
        <strong>{isRailOpen ? "Ocultar indice" : "Indice"}</strong>
      </button>

      <aside
        className="side-rail"
        id="presentation-rail"
        aria-hidden={!isRailOpen}
      >
        <SearchPanel
          query={query}
          matches={matches}
          onQueryChange={setQuery}
          onNavigate={navigateTo}
        />
        <SectionNav
          sections={sections}
          activeId={activeId}
          matchedIds={matchedIds}
          query={normalizedQuery}
          onNavigate={navigateTo}
        />
      </aside>
    </>
  );

  return (
    <Layout header={header} rail={rail} footer={<Footer />}>
      <HeroSection
        section={sections[0]}
        onExplore={() => navigateTo("punto-partida")}
        onIndex={() => navigateTo("indice")}
        onPresentation={() => handleModeChange("presentation")}
      />

      <IndexSection
        section={sections[1]}
        indexedSections={sections.slice(2)}
        onNavigate={navigateTo}
      />

      {sections.slice(2).map((section, index) => (
        <ContentSection
          key={section.id}
          section={section}
          index={index + 2}
          query={query}
          isSearchMatch={matchedIds.has(section.id)}
        >
          {section.id === "usabilidad-web" ? <VideoLayer /> : null}
          {section.id === "cierre" ? <DownloadPanel /> : null}
        </ContentSection>
      ))}

      <PresentationControls
        mode={mode}
        currentIndex={currentIndex}
        total={sections.length}
        onPrevious={previous}
        onNext={next}
        onModeChange={handleModeChange}
        onFullscreen={handleFullscreen}
      />
      <FloatingNotes activeSection={activeSection} />
      <Analytics />
    </Layout>
  );
}
