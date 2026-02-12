"use client";

import { useState } from "react";
import { Heart, Flag, Frame, Plus, Check } from "lucide-react";
import { useWorkspace } from "../hooks/use-workspace";

interface Beat {
  id: string;
  icon: typeof Heart;
  iconColor: string;
  iconBg: string;
  label: string;
  heading: string;
  prompt: string;
}

const BEATS: Beat[] = [
  {
    id: "first-moment",
    icon: Heart,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    label: "The first moment you knew",
    heading: "The first moment I knew",
    prompt:
      "Think back to when you realized this person was different. What were you doing? What did they say or do?",
  },
  {
    id: "challenge",
    icon: Flag,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50",
    label: "A challenge you overcame",
    heading: "A challenge we overcame",
    prompt:
      "A hard time that tested you — and what it taught you about each other…",
  },
  {
    id: "promise",
    icon: Frame,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    label: "A promise about the future",
    heading: "My promise to you",
    prompt:
      "The commitment that matters most — what will you do, every day, to keep this love alive?",
  },
];

function beatToHTML(beat: Beat): string {
  return `<h2>${beat.heading}</h2><p><em>${beat.prompt}</em></p><p></p>`;
}

export function StoryBeatCard() {
  const { insertHTML } = useWorkspace();
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  function handleInsert(beat: Beat) {
    if (usedIds.has(beat.id)) return;
    // Append to end of editor content (don't replace)
    insertHTML(beatToHTML(beat));
    setUsedIds((prev) => new Set(prev).add(beat.id));
  }

  const unusedBeats = BEATS.filter((b) => !usedIds.has(b.id));
  const usedBeats = BEATS.filter((b) => usedIds.has(b.id));

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide mb-2">
        Add a Story Beat
      </h3>

      {/* Available beats */}
      {unusedBeats.length > 0 && (
        <div className="space-y-0.5">
          {unusedBeats.map((beat) => {
            const Icon = beat.icon;
            return (
              <button
                key={beat.id}
                onClick={() => handleInsert(beat)}
                className="group flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left text-[13px] text-base-600 transition-colors hover:bg-sand-50 active:bg-sand-100"
              >
                <span
                  className={`flex items-center justify-center h-5.5 w-5.5 rounded ${beat.iconBg} shrink-0`}
                >
                  <Icon className={`h-3 w-3 ${beat.iconColor}`} />
                </span>
                <span className="flex-1 truncate">{beat.label}</span>
                <Plus className="h-3 w-3 text-base-300 group-hover:text-accent-500 transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Used beats */}
      {usedBeats.length > 0 && (
        <div className={unusedBeats.length > 0 ? "mt-1.5 pt-1.5 border-t border-base-100" : ""}>
          <p className="text-[10px] text-base-300 uppercase tracking-wide mb-1">
            Added
          </p>
          {usedBeats.map((beat) => {
            return (
              <div
                key={beat.id}
                className="flex items-center gap-2 px-2 py-1 text-[13px] text-base-400"
              >
                <span
                  className={`flex items-center justify-center h-5.5 w-5.5 rounded bg-green-50 shrink-0`}
                >
                  <Check className="h-3 w-3 text-green-500" />
                </span>
                <span className="flex-1 truncate">{beat.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
