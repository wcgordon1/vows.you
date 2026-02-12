"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const PRIMARY_TONES = ["Heartfelt", "Light & Funny"] as const;
const MORE_TONES = ["Poetic", "Playful", "Traditional", "Modern"] as const;
const ALL_TONES = [...PRIMARY_TONES, ...MORE_TONES];

export function ToneCard() {
  const [selected, setSelected] = useState<string>("Heartfelt");
  const [expanded, setExpanded] = useState(false);

  const visibleTones = expanded ? ALL_TONES : PRIMARY_TONES;

  // If a "more" tone is selected but panel is collapsed, show it in the primary row
  const isMoreToneSelected = MORE_TONES.includes(selected as (typeof MORE_TONES)[number]);
  const displayTones = !expanded && isMoreToneSelected
    ? [selected, ...PRIMARY_TONES.filter((t) => t !== selected)]
    : visibleTones;

  return (
    <div className="rounded-lg border border-base-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-base-800">Pick a Tone</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center h-6 w-6 rounded-md text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
        >
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displayTones.map((tone) => (
          <button
            key={tone}
            onClick={() => setSelected(tone)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selected === tone
                ? "bg-base-900 text-white"
                : "bg-sand-100 text-base-600 hover:bg-sand-200"
            }`}
          >
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}
