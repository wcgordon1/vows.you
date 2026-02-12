"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { ToneCard } from "./tone-card";
import { LengthCard } from "./length-card";
import { StoryBeatCard } from "./story-beat-card";

export function GuidePanel() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`shrink-0 border-l border-base-200 bg-sand-50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? "w-12" : "w-[320px]"
      }`}
    >
      {collapsed ? (
        <div className="flex flex-col items-center py-4">
          <button
            onClick={() => setCollapsed(false)}
            title="Show Guide"
            className="flex items-center justify-center h-8 w-8 rounded-md text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <PanelRightOpen className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200">
            <h2 className="text-sm font-semibold text-base-800">Guide</h2>
            <button
              onClick={() => setCollapsed(true)}
              title="Hide Guide"
              className="flex items-center justify-center h-7 w-7 rounded-md text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {/* Gentle progress nudge */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-accent-600 font-medium bg-accent-50 rounded-full px-2.5 py-0.5">
                Recommended
              </span>
            </div>

            <ToneCard />
            <LengthCard />
            <StoryBeatCard />
          </div>
        </>
      )}
    </div>
  );
}
