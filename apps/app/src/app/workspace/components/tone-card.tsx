"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";

const PRIMARY_TONES = ["Heartfelt", "Light & Funny"] as const;
const MORE_TONES = ["Poetic", "Playful", "Traditional", "Modern"] as const;
const ALL_TONES = [...PRIMARY_TONES, ...MORE_TONES];

export function ToneCard() {
  const [selected, setSelected] = useState<string>("Heartfelt");
  const [expanded, setExpanded] = useState(false);

  const visibleTones = expanded ? ALL_TONES : PRIMARY_TONES;
  const isMoreToneSelected = MORE_TONES.includes(
    selected as (typeof MORE_TONES)[number],
  );
  const displayTones =
    !expanded && isMoreToneSelected
      ? [selected, ...PRIMARY_TONES.filter((t) => t !== selected)]
      : visibleTones;

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
          Pick a Tone
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center h-5 w-5 rounded text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
        >
          {expanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displayTones.map((tone) => (
          <button
            key={tone}
            onClick={() => setSelected(tone)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              selected === tone
                ? "bg-base-900 text-white ring-1 ring-base-900"
                : "bg-sand-50 text-base-500 hover:bg-sand-100 hover:text-base-700 border border-base-200"
            }`}
          >
            {selected === tone && <Check className="h-2.5 w-2.5" />}
            {tone}
          </button>
        ))}
      </div>
    </div>
  );
}
