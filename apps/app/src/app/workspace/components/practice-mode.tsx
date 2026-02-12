"use client";

import { useMemo, useEffect, useCallback } from "react";
import { X, Play, Pause, RotateCcw, Clock } from "lucide-react";
import {
  type TiptapJSON,
  type SpeedPreset,
  type Segment,
  WPM_PRESETS,
  extractPlainText,
  estimateSpeakingTime,
  splitIntoSegments,
} from "../lib/vow-utils";
import { useTeleprompter } from "../hooks/use-teleprompter";

// ─── Speed pill labels ───────────────────────────────────────────────────────

const SPEED_OPTIONS: { key: SpeedPreset; label: string }[] = [
  { key: "slow", label: "Slow" },
  { key: "medium", label: "Medium" },
  { key: "fast", label: "Fast" },
];

// ─── Props ───────────────────────────────────────────────────────────────────

interface PracticeModeProps {
  tiptapJSON: TiptapJSON;
  onClose: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PracticeMode({ tiptapJSON, onClose }: PracticeModeProps) {
  // Derive text + segments from JSON
  const plainText = useMemo(() => extractPlainText(tiptapJSON), [tiptapJSON]);

  const segments = useMemo(() => splitIntoSegments(plainText), [plainText]);

  const {
    isPlaying,
    currentIndex,
    speedPreset,
    scrollContainerRef,
    focusLineFraction,
    restart,
    setSpeed,
    togglePlayPause,
  } = useTeleprompter(segments);

  const wpm = WPM_PRESETS[speedPreset];
  const { display: readingTime } = useMemo(
    () => estimateSpeakingTime(plainText, wpm),
    [plainText, wpm],
  );

  // Group segments by paragraph for rendering
  const paragraphGroups = useMemo(() => {
    const groups: Segment[][] = [];
    let lastPIdx = -1;

    for (const seg of segments) {
      if (seg.paragraphIndex !== lastPIdx) {
        groups.push([]);
        lastPIdx = seg.paragraphIndex;
      }
      groups[groups.length - 1].push(seg);
    }

    return groups;
  }, [segments]);

  // Build a flat index offset map so we can compute the global segment index
  // from paragraphGroupIndex + inner index.
  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let running = 0;
    for (const group of paragraphGroups) {
      offsets.push(running);
      running += group.length;
    }
    return offsets;
  }, [paragraphGroups]);

  const isEmpty = segments.length === 0;

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === "r" || e.key === "R") {
        restart();
      }
    },
    [togglePlayPause, onClose, restart],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sand-50">
      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
        {/* Left — Title */}
        <h2 className="text-lg font-serif font-semibold text-base-900">
          Practice Mode
        </h2>

        {/* Center — Speed selector */}
        <div className="flex items-center gap-1 rounded-full bg-sand-100 p-1">
          {SPEED_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSpeed(key)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-all ${
                speedPreset === key
                  ? "bg-white text-base-800 shadow-sm"
                  : "text-base-400 hover:text-base-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right — Reading time + Close */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-base-400">
            <Clock className="h-4 w-4" />
            <span>{readingTime}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ── Scroll container with focus line ─────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
      >
        {/* Focus line overlay */}
        <div
          className="sticky z-20 pointer-events-none"
          style={{ top: `${focusLineFraction * 100}%` }}
        >
          <div className="h-px w-full bg-accent-300/40" />
          <div className="h-8 w-full bg-linear-to-b from-accent-300/10 to-transparent" />
        </div>

        {/* Top fade */}
        <div className="sticky top-0 h-12 bg-linear-to-b from-sand-50 to-transparent pointer-events-none z-10" />

        <div className="max-w-2xl mx-auto px-8 py-12">
          <h3 className="text-center text-sm uppercase tracking-widest text-base-400 mb-12">
            Your Wedding Vows
          </h3>

          {isEmpty ? (
            <p className="text-2xl font-serif leading-relaxed text-base-400 text-center italic">
              Start writing your vows to see them here...
            </p>
          ) : (
            <div className="space-y-8">
              {paragraphGroups.map((group, gIdx) => (
                <p
                  key={gIdx}
                  className="text-2xl font-serif leading-relaxed text-center"
                >
                  {group.map((seg, sIdx) => {
                    const globalIndex = groupOffsets[gIdx] + sIdx;
                    const isActive = globalIndex === currentIndex;
                    const isPast = globalIndex < currentIndex;

                    return (
                      <span
                        key={globalIndex}
                        data-segment-index={globalIndex}
                        className={`transition-all duration-300 ${
                          isActive
                            ? "text-base-900 font-semibold"
                            : isPast
                              ? "text-base-400"
                              : "text-base-600"
                        }`}
                      >
                        {sIdx > 0 ? " " : ""}
                        {seg.text}
                      </span>
                    );
                  })}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Bottom spacer so last segment can scroll up to focus line */}
        <div className="h-[60vh]" />

        {/* Bottom fade */}
        <div className="sticky bottom-0 h-12 bg-linear-to-t from-sand-50 to-transparent pointer-events-none z-10" />
      </div>

      {/* ── Bottom controls ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-4 px-6 py-6 border-t border-base-200">
        <button
          onClick={restart}
          className="flex items-center justify-center h-10 w-10 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          title="Restart"
        >
          <RotateCcw className="h-5 w-5" />
        </button>
        <button
          onClick={togglePlayPause}
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
              {currentIndex > 0 ? "Resume" : "Start"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

