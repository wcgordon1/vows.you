"use client";

import { useState } from "react";
import { FileText, Lock, Check } from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";

// ─── Outline Definitions ─────────────────────────────────────────────────────

interface OutlineSection {
  heading: string;
  prompt: string;
}

interface OutlineDefinition {
  id: string;
  label: string;
  description: string;
  duration: string;
  sections: OutlineSection[];
  free: boolean;
}

const OUTLINES: OutlineDefinition[] = [
  {
    id: "classic",
    label: "Classic",
    description: "The tried-and-true structure most officiants love",
    duration: "2–3 min",
    free: true,
    sections: [
      {
        heading: "How we began",
        prompt: "The moment you knew this person was different…",
      },
      {
        heading: "What I love about you",
        prompt: "The qualities that made you fall deeper over time…",
      },
      {
        heading: "What we've built together",
        prompt: "A challenge you faced, or a memory that defined your bond…",
      },
      {
        heading: "My promises to you",
        prompt: "The commitments you want to make — specific, real, yours…",
      },
      {
        heading: "Looking ahead",
        prompt: "Your vision for the life you'll build together…",
      },
    ],
  },
  {
    id: "funny-light",
    label: "Funny & Light",
    description: "Opens with humor, lands on sincerity",
    duration: "2–3 min",
    free: false,
    sections: [
      {
        heading: "The honest first impression",
        prompt:
          "What you actually thought when you first met — the unfiltered version…",
      },
      {
        heading: "The ridiculous thing that made me fall",
        prompt:
          "A weird, funny, or unexpected moment when you realized this was it…",
      },
      {
        heading: "What nobody else knows",
        prompt: "An inside joke or private moment that captures who you are together…",
      },
      {
        heading: "The serious part",
        prompt:
          "Drop the jokes for a moment — what do you truly want them to know?",
      },
      {
        heading: "My promises (with a twist)",
        prompt: "Commitments that sound like you — honest, maybe funny, always real…",
      },
    ],
  },
  {
    id: "modern-minimal",
    label: "Modern Minimal",
    description: "Distilled and direct — every word earns its place",
    duration: "1–2 min",
    free: false,
    sections: [
      {
        heading: "One moment",
        prompt: "The single memory that says everything about why you're here…",
      },
      {
        heading: "One truth",
        prompt: "The thing about them that changed how you see the world…",
      },
      {
        heading: "One promise",
        prompt: "The commitment that matters most — just one, said with conviction…",
      },
    ],
  },
  {
    id: "short-vows",
    label: "Short & Sweet",
    description: "Three powerful lines — remember, promise, commit",
    duration: "Under 1 min",
    free: false,
    sections: [
      {
        heading: "I remember",
        prompt: "The moment that brought you here…",
      },
      {
        heading: "I promise",
        prompt: "The one thing you'll always do…",
      },
      {
        heading: "I choose you",
        prompt: "Why you choose this person, every day…",
      },
    ],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

function outlineToHTML(outline: OutlineDefinition): string {
  return outline.sections
    .map(
      (s) =>
        `<h2>${s.heading}</h2><p><em>${s.prompt}</em></p><p></p>`,
    )
    .join("");
}

export function OutlineCard() {
  const { insertHTML, state, requestAction } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;
  const [insertedId, setInsertedId] = useState<string | null>(null);

  function handleInsert(outline: OutlineDefinition) {
    if (!outline.free && !isPaid) {
      requestAction("VIEW_SUGGESTIONS");
      return;
    }
    insertHTML(outlineToHTML(outline), { replace: true });
    setInsertedId(outline.id);
  }

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide mb-0.5">
        Choose an Outline
      </h3>
      <p className="text-[11px] text-base-400 mb-2.5">
        A structure to guide your writing — not a script.
      </p>

      <div className="space-y-1">
        {OUTLINES.map((outline) => {
          const isLocked = !outline.free && !isPaid;
          const isInserted = insertedId === outline.id;

          return (
            <button
              key={outline.id}
              onClick={() => handleInsert(outline)}
              disabled={isInserted}
              className={`group flex items-start gap-2.5 w-full rounded-lg px-2.5 py-2 text-left transition-colors ${
                isInserted
                  ? "bg-green-50/60 border border-green-200/60"
                  : isLocked
                    ? "hover:bg-sand-50/60"
                    : "hover:bg-sand-50 active:bg-sand-100"
              }`}
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-md bg-sand-50 border border-base-200/60 shrink-0 mt-0.5">
                {isInserted ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : isLocked ? (
                  <Lock className="h-2.5 w-2.5 text-base-300" />
                ) : (
                  <FileText className="h-3 w-3 text-base-400" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[12px] font-medium ${isInserted ? "text-green-700" : isLocked ? "text-base-400" : "text-base-700"}`}
                  >
                    {outline.label}
                  </span>
                  <span className="text-[10px] text-base-300">
                    {outline.duration}
                  </span>
                  {outline.free && (
                    <span className="text-[9px] font-medium text-accent-500 uppercase tracking-wider">
                      Free
                    </span>
                  )}
                </div>
                <p
                  className={`text-[11px] leading-snug mt-0.5 ${isLocked ? "text-base-300" : "text-base-400"}`}
                >
                  {outline.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {!isPaid && (
        <button
          onClick={() => requestAction("VIEW_SUGGESTIONS")}
          className="mt-2 text-[11px] font-medium text-accent-600 hover:text-accent-700 transition-colors"
        >
          Unlock all outlines
        </button>
      )}
    </div>
  );
}
