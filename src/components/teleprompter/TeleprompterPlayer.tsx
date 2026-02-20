import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Maximize,
  Minimize,
  FlipHorizontal2,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { decodeText, isEmbedMode } from "../../lib/teleprompter/compression";
import { parseContent } from "../../lib/teleprompter/parser";
import { estimateSpeakingTime } from "../../lib/teleprompter/word-timing";
import { SPEED_OPTIONS, WPM_PRESETS } from "../../lib/teleprompter/types";
import { useTeleprompter } from "./use-teleprompter";
import { useWordHighlighter, syncHighlight } from "./use-word-highlighter";

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function detectEmbed(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  if (isEmbedMode(url)) return true;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export default function TeleprompterPlayer() {
  const [rawText, setRawText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [embed, setEmbed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    const isEmbed = detectEmbed();
    setEmbed(isEmbed);

    const url = new URL(window.location.href);
    const decoded = decodeText(url);
    if (decoded) {
      if (typeof decoded === "object" && "error" in decoded) {
        setError(decoded.error);
      } else {
        setRawText(decoded);
      }
      return;
    }

    const handler = (e: MessageEvent) => {
      if (e.data?.type === "teleprompter:text" && typeof e.data.text === "string") {
        setRawText(e.data.text);
      }
    };
    window.addEventListener("message", handler);

    const timeout = setTimeout(() => {
      setError("No text found. Go back and paste your vows first.");
    }, 1500);

    return () => {
      window.removeEventListener("message", handler);
      clearTimeout(timeout);
    };
  }, []);

  const safeHtml = useMemo(() => {
    if (!rawText) return "";
    return parseContent(rawText);
  }, [rawText]);

  const { wrapWords, reset: resetWords } = useWordHighlighter(contentRef);

  useEffect(() => {
    if (!safeHtml || !contentRef.current) return;
    contentRef.current.innerHTML = safeHtml;
    resetWords();
    const extracted = wrapWords();
    setWords(extracted);
  }, [safeHtml, wrapWords, resetWords]);

  const {
    isPlaying,
    currentWordIndex,
    speedPreset,
    elapsedMs,
    isMirrored,
    isFullscreen,
    wpm,
    scrollContainerRef,
    fullscreenRef,
    restart,
    setSpeed,
    togglePlayPause,
    toggleMirror,
    toggleFullscreen,
  } = useTeleprompter(words);

  useEffect(() => {
    syncHighlight(contentRef.current, currentWordIndex);
  }, [currentWordIndex]);

  const readingTime = useMemo(
    () => estimateSpeakingTime(words.length, wpm),
    [words.length, wpm],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "Escape":
          if (!embed) window.location.href = "/teleprompter";
          break;
        case "r":
        case "R":
          restart();
          break;
        case "f":
        case "F":
          if (!embed) toggleFullscreen();
          break;
        case "m":
        case "M":
          toggleMirror();
          break;
      }
    },
    [togglePlayPause, restart, toggleFullscreen, toggleMirror, embed],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!embed) return;
    const height = document.documentElement.scrollHeight;
    window.parent.postMessage({ type: "teleprompter:resize", height }, "*");
  });

  // ── Loading / Error states ────────────────────────────────────────────────
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-sand-50 gap-6 px-6 ${embed ? "h-full" : "min-h-screen"}`}>
        <p className="text-lg font-serif text-base-500 text-center">{error}</p>
        {!embed && (
          <a
            href="/teleprompter"
            className="inline-flex items-center gap-2 rounded-full bg-accent-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </a>
        )}
      </div>
    );
  }

  if (!rawText) {
    return (
      <div className={`flex items-center justify-center bg-sand-50 ${embed ? "h-full" : "min-h-screen"}`}>
        <div className="flex items-center gap-3 text-base-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-base-300 border-t-accent-500" />
          <span className="text-sm">Loading your vows&hellip;</span>
        </div>
      </div>
    );
  }

  const shortcuts = [
    { key: "Space", label: "play / pause" },
    { key: "R", label: "restart" },
    ...(!embed ? [{ key: "F", label: "fullscreen" }] : []),
    { key: "M", label: "mirror" },
  ];

  return (
    <div
      ref={fullscreenRef}
      className={`flex flex-col bg-sand-50 overflow-hidden ${
        embed ? "h-full" : "h-screen"
      } ${isMirrored ? "transform-[scaleX(-1)]" : ""}`}
    >
      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between border-b border-base-200 bg-sand-50 z-30 shrink-0 px-4 sm:px-6 py-3">
        {/* Left */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!embed && (
            <a
              href="/teleprompter"
              className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600 shrink-0"
              title="Back to editor"
            >
              <ArrowLeft className="h-4 w-4" />
            </a>
          )}
          {!embed && (
            <h2 className="text-sm sm:text-base font-serif font-semibold text-base-900 truncate">
              Practice Mode
            </h2>
          )}
          <div
            className={`flex items-center gap-1 font-mono tabular-nums shrink-0 text-sm ${
              isPlaying ? "text-accent-600" : "text-base-400"
            }`}
          >
            <Timer className="h-3.5 w-3.5" />
            <span>{formatElapsed(elapsedMs)}</span>
          </div>
        </div>

        {/* Center — Speed selector */}
        <div className="flex items-center gap-0.5 rounded-full bg-sand-100 p-1">
          {SPEED_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSpeed(key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                speedPreset === key
                  ? "bg-white text-base-800 shadow-sm"
                  : "text-base-400 hover:text-base-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {!embed && (
            <span className="hidden sm:inline text-xs text-base-400">
              {readingTime}
            </span>
          )}
          <button
            onClick={toggleMirror}
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
              isMirrored
                ? "bg-accent-100 text-accent-600"
                : "text-base-400 hover:bg-sand-100 hover:text-base-600"
            }`}
            title="Mirror mode (M)"
          >
            <FlipHorizontal2 className="h-4 w-4" />
          </button>
          {!embed && (
            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* ── Scroll container ───────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative min-h-0"
        onClick={togglePlayPause}
      >
        {/* Top fade */}
        <div className="sticky top-0 h-6 bg-linear-to-b from-sand-50 to-transparent pointer-events-none z-10" />

        {/* Content area */}
        <div className="max-w-2xl mx-auto px-6 sm:px-8 py-12 sm:py-16">
          <div
            ref={contentRef}
            className="tp-content text-2xl sm:text-3xl font-serif leading-relaxed sm:leading-relaxed text-center"
          />
        </div>

        {/* Bottom spacer */}
        <div className="h-[65vh]" />

        {/* Bottom fade */}
        <div className="sticky bottom-0 h-6 bg-linear-to-t from-sand-50 to-transparent pointer-events-none z-10" />

        {/* Floating keyboard strip — non-embed only */}
        {!embed && (
          <div className="hidden sm:flex items-center justify-center pointer-events-none sticky bottom-8 z-20">
            <div className="pointer-events-auto flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-base-200/60 shadow-sm rounded-full px-5 py-2">
              {shortcuts.map(({ key, label }, i) => (
                <div key={key} className="flex items-center gap-1.5">
                  {i > 0 && <span className="w-px h-3 bg-base-200 mr-1.5" />}
                  <kbd className="inline-flex items-center justify-center rounded-md border border-base-200 bg-white font-mono font-medium text-base-600 shadow-[0_1px_0_0_var(--color-base-200)] px-2 py-0.5 text-xs min-w-6">
                    {key}
                  </kbd>
                  <span className="text-base-500 text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="shrink-0 z-30 border-t border-base-200 bg-sand-50 px-4 sm:px-6 py-3 sm:py-4">
        {/* Keyboard strip in footer — embed only */}
        {embed && (
          <div className="hidden sm:flex items-center justify-center gap-3 mb-3">
            {shortcuts.map(({ key, label }, i) => (
              <div key={key} className="flex items-center gap-1.5">
                {i > 0 && <span className="w-px h-3 bg-base-200 mr-1.5" />}
                <kbd className="inline-flex items-center justify-center rounded-md border border-base-200 bg-white font-mono font-medium text-base-600 shadow-[0_1px_0_0_var(--color-base-200)] px-2 py-0.5 text-xs min-w-6">
                  {key}
                </kbd>
                <span className="text-base-500 text-xs">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Play controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              restart();
            }}
            className="flex items-center justify-center h-10 w-10 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
            title="Restart (R)"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="flex items-center gap-2 rounded-full bg-accent-500 px-8 py-3 text-base font-medium text-white shadow-md transition-colors hover:bg-accent-600"
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5 fill-current" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                {currentWordIndex > 0 ? "Resume" : "Start"}
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}
