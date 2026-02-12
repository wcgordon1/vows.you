"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";
import {
  getSeverityBucketDisplay,
  getCategoryDisplayName,
  type VowAnalysis,
  type VowCategory,
  type TopPhraseEntry,
} from "@/lib/vow-review";

const MIN_WORD_COUNT = 300;

// ─── Category icons (matching guide panel palette) ───────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  cliche_opening: "text-amber-500",
  cliche_closing: "text-amber-500",
  generic_promise: "text-red-400",
  vague_admiration: "text-orange-400",
  cringe_phrase: "text-red-500",
  filler_intensifier: "text-blue-400",
  overpromise_absolute: "text-purple-400",
  too_formal_scripted: "text-slate-400",
};

// ─── Severity dot ────────────────────────────────────────────────────────────

function SeverityDot({ bucket }: { bucket: string }) {
  const display = getSeverityBucketDisplay(
    bucket as "great" | "fair" | "weak",
  );
  const dotColor =
    bucket === "great"
      ? "bg-green-500"
      : bucket === "fair"
        ? "bg-amber-500"
        : "bg-red-500";

  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span className={`text-[11px] font-medium ${display.colorClass}`}>
        {display.label}
      </span>
    </span>
  );
}

// ─── Animated count ──────────────────────────────────────────────────────────

function AnimatedCount({ value }: { value: number }) {
  const prevRef = useRef(value);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (value !== prevRef.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 350);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <span
      className={`inline-block tabular-nums ${pulse ? "suggestions-count-pulse" : ""}`}
    >
      {value}
    </span>
  );
}

// ─── Category breakdown row ──────────────────────────────────────────────────

function CategoryRow({
  category,
  count,
}: {
  category: string;
  count: number;
}) {
  const color = CATEGORY_COLORS[category] ?? "text-base-400";
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-[11px] text-base-500">
        {getCategoryDisplayName(category)}
      </span>
      <span className={`text-[11px] font-semibold ${color}`}>{count}</span>
    </div>
  );
}

// ─── Phrase detail (paid only) ───────────────────────────────────────────────

function PhraseDetail({ phrase }: { phrase: TopPhraseEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border border-base-100 bg-sand-50/40 p-2">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left gap-2"
      >
        <span className="text-[11px] font-medium text-base-700 truncate flex-1">
          &ldquo;{phrase.displayText}&rdquo;
        </span>
        <span className="flex items-center gap-1 shrink-0">
          {phrase.count > 1 && (
            <span className="text-[10px] text-base-400">
              x{phrase.count}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="h-2.5 w-2.5 text-base-400" />
          ) : (
            <ChevronDown className="h-2.5 w-2.5 text-base-400" />
          )}
        </span>
      </button>

      {expanded && (
        <div className="mt-2 space-y-1.5">
          <p className="text-[11px] text-base-500 leading-relaxed">
            {phrase.why}
          </p>
          <div className="space-y-0.5">
            <p className="text-[10px] font-semibold text-base-600 uppercase tracking-wide">
              Try instead
            </p>
            {phrase.suggestions.slice(0, 3).map((s, i) => (
              <p key={i} className="text-[11px] text-accent-600 leading-snug">
                &bull; {s}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function SuggestionsCard() {
  const { vowAnalysis, isSignedIn, state, requestAction } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;

  // First-error glow: pulse once when count first goes above 0
  const hadErrorsRef = useRef(false);
  const [glowing, setGlowing] = useState(false);

  const totalIssues = vowAnalysis ? vowAnalysis.weakHits : 0;
  const hasContent = vowAnalysis ? vowAnalysis.totalWords > 0 : false;

  useEffect(() => {
    if (totalIssues > 0 && !hadErrorsRef.current) {
      hadErrorsRef.current = true;
      setGlowing(true);
      const t = setTimeout(() => setGlowing(false), 1000);
      return () => clearTimeout(t);
    }
    if (totalIssues === 0) {
      hadErrorsRef.current = false;
    }
  }, [totalIssues]);

  // ── Empty / idle state ────────────────────────────────────────────────────

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-base-200 bg-white p-3.5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
            Suggestions
          </h3>
          <Sparkles className="h-3 w-3 text-base-300" />
        </div>
        <p className="text-[11px] text-base-400 leading-relaxed">
          Start writing and suggestions will appear here as you type.
        </p>
      </div>
    );
  }

  const analysis = vowAnalysis as VowAnalysis;
  const isTooShort = analysis.totalWords < MIN_WORD_COUNT;

  // Build category list (only non-zero)
  const activeCategories = Object.entries(analysis.categoryCounts)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  // ── Paid view ─────────────────────────────────────────────────────────────

  if (isPaid) {
    return (
      <div
        className={`rounded-lg border border-base-200 bg-white p-3.5 ${glowing ? "suggestions-card-glow" : ""}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
            Suggestions
          </h3>
          <SeverityDot bucket={analysis.severityBucket} />
        </div>

        {/* Count summary */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[11px] text-base-500">
            <AnimatedCount value={totalIssues} />{" "}
            {totalIssues === 1 ? "improvement" : "improvements"} found
          </span>
        </div>

        {/* Word count warning */}
        {isTooShort && (
          <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200/60">
            <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
            <span className="text-[11px] text-amber-700">
              Under {MIN_WORD_COUNT} words — add more detail
            </span>
          </div>
        )}

        {/* Top phrases (expandable) */}
        {analysis.topPhrases.length > 0 && (
          <div className="space-y-1.5 mt-2">
            {analysis.topPhrases.map((phrase) => (
              <PhraseDetail key={phrase.phraseKey} phrase={phrase} />
            ))}
          </div>
        )}

        {/* Category breakdown */}
        {activeCategories.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-base-100">
            {activeCategories.map(([cat, count]) => (
              <CategoryRow
                key={cat}
                category={cat}
                count={count}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Free / signed-out view ────────────────────────────────────────────────

  return (
    <div
      className={`rounded-lg border border-base-200 bg-white p-3.5 ${glowing ? "suggestions-card-glow" : ""}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
          Suggestions
        </h3>
        <SeverityDot bucket={analysis.severityBucket} />
      </div>

      {/* Count summary */}
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-[11px] text-base-500">
          <AnimatedCount value={totalIssues} />{" "}
          {totalIssues === 1 ? "improvement" : "improvements"} found
        </span>
      </div>

      {/* Word count warning */}
      {isTooShort && (
        <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 rounded-md bg-amber-50 border border-amber-200/60">
          <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0" />
          <span className="text-[11px] text-amber-700">
            Under {MIN_WORD_COUNT} words — add more detail
          </span>
        </div>
      )}

      {/* Category breakdown (the teaser — shows types but not details) */}
      {activeCategories.length > 0 && (
        <div className="space-y-0.5 mb-2.5">
          {activeCategories.map(([cat, count]) => (
            <CategoryRow
              key={cat}
              category={cat as VowCategory}
              count={count}
            />
          ))}
        </div>
      )}

      {/* Upgrade CTA */}
      <button
        onClick={() => requestAction("VIEW_SUGGESTIONS")}
        className="flex items-center justify-center gap-1.5 w-full mt-1 rounded-lg border border-accent-200 bg-accent-50/60 px-3 py-2 text-[11px] font-medium text-accent-700 transition-colors hover:bg-accent-100 hover:border-accent-300"
      >
        <Lock className="h-3 w-3" />
        See all suggestions
      </button>
    </div>
  );
}
