"use client";

import { useState } from "react";

const LENGTHS = ["Short", "Medium", "Long"] as const;

export function LengthCard() {
  const [selected, setSelected] = useState<string>("Medium");

  return (
    <div className="rounded-lg border border-base-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-base-800 mb-2">
        Target Length
      </h3>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {LENGTHS.map((length) => (
          <button
            key={length}
            onClick={() => setSelected(length)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selected === length
                ? "bg-base-900 text-white"
                : "bg-sand-100 text-base-600 hover:bg-sand-200"
            }`}
          >
            {length}
          </button>
        ))}
      </div>
      <p className="text-xs text-base-400">
        The ceremony sweet spot is 2–3 minutes
      </p>
    </div>
  );
}
