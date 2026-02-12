"use client";

import { useState } from "react";

const TONES = ["Heartfelt", "Light & Funny"] as const;

export function ToneCard() {
  const [selected, setSelected] = useState<string>("Heartfelt");

  return (
    <div className="rounded-lg border border-base-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-base-800 mb-3">Pick a Tone</h3>
      <div className="flex gap-2">
        {TONES.map((tone) => (
          <button
            key={tone}
            onClick={() => setSelected(tone)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
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
