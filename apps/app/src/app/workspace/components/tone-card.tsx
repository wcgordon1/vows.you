"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

const PRIMARY_TONES = ["Heartfelt", "Light & Funny"] as const;
const MORE_TONES = ["Poetic", "Playful", "Traditional", "Modern"] as const;
const ALL_TONES = [...PRIMARY_TONES, ...MORE_TONES];

export function ToneCard() {
  const [selected, setSelected] = useState<string>("Heartfelt");
  const [collapsed, setCollapsed] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  function handleSelect(tone: string) {
    setSelected(tone);
    if (!hasInteracted) {
      setHasInteracted(true);
      // Auto-collapse after first deliberate selection
      setTimeout(() => setCollapsed(true), 400);
    }
  }

  // Collapsed: show selected value inline, click to expand
  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="flex items-center justify-between w-full rounded-lg border border-base-200 bg-white px-3.5 py-2.5 text-left transition-colors hover:bg-sand-50/60 group"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-base-700 uppercase tracking-wide">
            Tone
          </span>
          <span className="text-xs text-base-500">&middot;</span>
          <span className="text-xs font-medium text-base-600">{selected}</span>
        </div>
        <ChevronDown className="h-3 w-3 text-base-300 group-hover:text-base-500 transition-colors" />
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide">
          Pick a Tone
        </h3>
        {hasInteracted && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-[10px] text-base-400 hover:text-base-600 transition-colors"
          >
            Done
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_TONES.map((tone) => (
          <button
            key={tone}
            onClick={() => handleSelect(tone)}
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
