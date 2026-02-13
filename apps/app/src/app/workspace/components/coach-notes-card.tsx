"use client";

import { useState } from "react";
import { Feather, ChevronDown, ChevronUp, Lock } from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";
import type { VowAnalysis, TopPhraseEntry } from "@/lib/vow-review";

// ─── Supportive status mapping ───────────────────────────────────────────────

type CoachStatus = "in-progress" | "almost-ready" | "ready-to-practice" | "ceremony-ready";

function getCoachStatus(analysis: VowAnalysis): CoachStatus {
  const { totalWords, severityBucket } = analysis;

  if (totalWords < 150) return "in-progress";

  if (severityBucket === "great") {
    return totalWords >= 300 ? "ceremony-ready" : "ready-to-practice";
  }
  if (severityBucket === "fair") return "almost-ready";
  return "in-progress";
}

const STATUS_CONFIG: Record<
  CoachStatus,
  { label: string; color: string; dotColor: string }
> = {
  "in-progress": {
    label: "In progress",
    color: "text-base-500",
    dotColor: "bg-base-300",
  },
  "almost-ready": {
    label: "Almost ready",
    color: "text-amber-600",
    dotColor: "bg-amber-400",
  },
  "ready-to-practice": {
    label: "Ready to practice",
    color: "text-blue-600",
    dotColor: "bg-blue-400",
  },
  "ceremony-ready": {
    label: "Ceremony-ready",
    color: "text-green-600",
    dotColor: "bg-green-500",
  },
};

// ─── Single note (paid) ──────────────────────────────────────────────────────

function NoteDetail({ phrase }: { phrase: TopPhraseEntry }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-base-100 bg-sand-50/40 p-2.5">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-start justify-between w-full text-left gap-2"
      >
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-base-600 leading-snug">
            <span className="font-medium">&ldquo;{phrase.displayText}&rdquo;</span>
            {" "}&mdash;{" "}
            <span className="text-base-400">{phrase.why.split(".")[0]}.</span>
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-2.5 w-2.5 text-base-400 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown className="h-2.5 w-2.5 text-base-400 shrink-0 mt-0.5" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1">
          <p className="text-[10px] font-semibold text-base-500 uppercase tracking-wide">
            Try instead
          </p>
          {phrase.suggestions.slice(0, 3).map((s, i) => (
            <p key={i} className="text-[11px] text-accent-600 leading-snug">
              &bull; {s}
            </p>
          ))}
          {phrase.proofPrompts.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-base-500 uppercase tracking-wide mt-1.5">
                Ask yourself
              </p>
              {phrase.proofPrompts.slice(0, 2).map((p, i) => (
                <p key={i} className="text-[11px] text-base-500 italic leading-snug">
                  {p}
                </p>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Free note teaser ────────────────────────────────────────────────────────

function FreeNoteTeaser({ phrase }: { phrase: TopPhraseEntry }) {
  return (
    <div className="rounded-lg border border-base-100 bg-sand-50/40 p-2.5">
      <p className="text-[11px] text-base-600 leading-snug">
        <span className="font-medium">&ldquo;{phrase.displayText}&rdquo;</span>
        {" "}&mdash;{" "}
        <span className="text-base-400">{phrase.why.split(".")[0]}.</span>
      </p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function CoachNotesCard() {
  const { vowAnalysis, state, requestAction } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;

  const hasContent = vowAnalysis ? vowAnalysis.totalWords > 0 : false;

  // ── Empty / idle state ──────────────────────────────────────────────────

  if (!hasContent) {
    return (
      <div className="rounded-lg border border-base-200 bg-white p-3.5">
        <div className="flex items-center gap-2 mb-1.5">
          <Feather className="h-3 w-3 text-base-300" />
          <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
            Coach Notes
          </h3>
        </div>
        <p className="text-[13px] text-base-400 leading-relaxed font-serif italic">
          Start writing and your coach notes will appear here. Gentle
          suggestions to make your vows more personal.
        </p>
      </div>
    );
  }

  const analysis = vowAnalysis as VowAnalysis;
  const status = getCoachStatus(analysis);
  const statusConfig = STATUS_CONFIG[status];
  const topNotes = analysis.topPhrases;

  // Free users see top 1-2 high-impact notes
  const freeNotes = topNotes.slice(0, 2);
  const remainingCount = Math.max(0, analysis.weakHits - 2);

  // ── Paid view ───────────────────────────────────────────────────────────

  if (isPaid) {
    return (
      <div className="rounded-lg border border-base-200 bg-white p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Feather className="h-3 w-3 text-base-400" />
            <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
              Coach Notes
            </h3>
          </div>
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
            <span className={`text-[11px] font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </span>
        </div>

        {topNotes.length === 0 ? (
          <p className="text-[11px] text-base-400 leading-relaxed font-serif italic">
            Looking good - no common cliches detected. Your vows sound personal.
          </p>
        ) : (
          <div className="space-y-1.5">
            {topNotes.map((phrase) => (
              <NoteDetail key={phrase.phraseKey} phrase={phrase} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Free / signed-out view ──────────────────────────────────────────────

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Feather className="h-3 w-3 text-base-400" />
          <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
            Coach Notes
          </h3>
        </div>
        <span className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`} />
          <span className={`text-[11px] font-medium ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
        </span>
      </div>

      {freeNotes.length === 0 ? (
        <p className="text-[11px] text-base-400 leading-relaxed font-serif italic">
          {analysis.totalWords < 50
            ? "Keep writing — notes will appear as your vows take shape."
            : "Looking good so far. Keep going and we'll share any thoughts."}
        </p>
      ) : (
        <>
          <div className="space-y-1.5">
            {freeNotes.map((phrase) => (
              <FreeNoteTeaser key={phrase.phraseKey} phrase={phrase} />
            ))}
          </div>

          {remainingCount > 0 && (
            <button
              onClick={() => requestAction("VIEW_SUGGESTIONS")}
              className="flex items-center justify-center gap-1.5 w-full mt-2.5 rounded-lg border border-accent-200/80 bg-accent-50/40 px-3 py-2 text-[11px] font-medium text-accent-700 transition-colors hover:bg-accent-100/60 hover:border-accent-300"
            >
              <Lock className="h-3 w-3" />
              See all {analysis.weakHits} notes
            </button>
          )}
        </>
      )}
    </div>
  );
}
