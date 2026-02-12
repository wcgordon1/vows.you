"use client";

import { useState } from "react";
import { Check } from "lucide-react";

const LENGTHS = ["Short", "Medium", "Long"] as const;

const DESCRIPTIONS: Record<string, string> = {
  Short: "Under 1 minute — brief & punchy",
  Medium: "2–3 minutes — the sweet spot",
  Long: "4+ minutes — full storytelling",
};

export function LengthCard() {
  const [selected, setSelected] = useState<string>("Medium");

  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide mb-2">
        Target Length
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {LENGTHS.map((length) => (
          <button
            key={length}
            onClick={() => setSelected(length)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${
              selected === length
                ? "bg-base-900 text-white ring-1 ring-base-900"
                : "bg-sand-50 text-base-500 hover:bg-sand-100 hover:text-base-700 border border-base-200"
            }`}
          >
            {selected === length && <Check className="h-2.5 w-2.5" />}
            {length}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-base-400">{DESCRIPTIONS[selected]}</p>
    </div>
  );
}
