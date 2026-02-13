"use client";

import { Pen, ListTree, Play, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "../hooks/use-workspace";
import { track } from "../lib/analytics";

type Phase = "start" | "structure" | "practice" | "polish";

function getPhase(words: number): Phase {
  if (words === 0) return "start";
  if (words < 150) return "structure";
  if (words < 400) return "practice";
  return "polish";
}

const PHASE_CONFIG: Record<
  Phase,
  {
    message: string;
    cta: string;
    icon: typeof Pen;
    accent: string;
  }
> = {
  start: {
    message: "Begin with one vivid memory - the rest will follow.",
    cta: "Insert a starter line",
    icon: Pen,
    accent: "text-accent-600",
  },
  structure: {
    message: "You're finding your voice. Add structure to build momentum.",
    cta: "Add a story beat",
    icon: ListTree,
    accent: "text-accent-600",
  },
  practice: {
    message: "Beautiful progress. Hearing it aloud makes all the difference.",
    cta: "Practice reading aloud",
    icon: Play,
    accent: "text-accent-600",
  },
  polish: {
    message: "Your vows are taking shape. A few small refinements will make them shine.",
    cta: "Review coach notes",
    icon: Sparkles,
    accent: "text-accent-600",
  },
};

interface NextStepModuleProps {
  /** Scroll to a card section in the guide panel */
  onScrollTo?: (section: "outlines" | "beats" | "notes") => void;
}

export function NextStepModule({ onScrollTo }: NextStepModuleProps) {
  const router = useRouter();
  const { vowAnalysis, insertHTML } = useWorkspace();
  const words = vowAnalysis?.totalWords ?? 0;
  const phase = getPhase(words);
  const config = PHASE_CONFIG[phase];
  const Icon = config.icon;

  function handleClick() {
    switch (phase) {
      case "start":
        insertHTML(
          '<p><em>The first time I saw you, I remember thinking…</em></p><p></p>',
          { replace: true },
        );
        break;
      case "structure":
        onScrollTo?.("beats");
        break;
      case "practice":
        track({ event: "practice_mode_opened" });
        router.push("/workspace/practice");
        break;
      case "polish":
        onScrollTo?.("notes");
        break;
    }
  }

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <p className="text-[12px] leading-relaxed text-base-600 font-serif italic mb-2.5">
        {config.message}
      </p>
      <button
        onClick={handleClick}
        className="flex items-center gap-2 w-full rounded-lg bg-sand-50 border border-base-200/60 px-3 py-2 text-[12px] font-medium text-base-700 transition-colors hover:bg-sand-100 hover:border-base-300 active:bg-sand-200"
      >
        <Icon className={`h-3.5 w-3.5 ${config.accent} shrink-0`} />
        {config.cta}
      </button>
    </div>
  );
}
