"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useMediaQuery } from "../hooks/use-media-query";
import { ToneCard } from "./tone-card";
import { LengthCard } from "./length-card";
import { StoryBeatCard } from "./story-beat-card";
import { SuggestionsCard } from "./suggestions-card";

export function GuidePanel() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [manualCollapsed, setManualCollapsed] = useState<boolean | null>(null);

  // Auto-collapse on mobile, but let user override
  const collapsed = manualCollapsed ?? isMobile;

  function toggle() {
    setManualCollapsed(!collapsed);
  }

  // Reset manual override when crossing breakpoint
  useEffect(() => {
    setManualCollapsed(null);
  }, [isMobile]);

  return (
    <div
      className={`shrink-0 border-l border-base-200/60 bg-sand-50/50 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
        collapsed ? "w-11" : "w-[300px]"
      }`}
    >
      {collapsed ? (
        <div className="flex flex-col items-center py-3">
          <button
            onClick={toggle}
            title="Show Guide"
            className="flex items-center justify-center h-7 w-7 rounded-md text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-200/60">
            <div>
              <h2 className="text-sm font-semibold text-base-800">Guide</h2>
              <p className="text-[11px] text-base-400 mt-0.5">
                3 quick steps to shape your vows
              </p>
            </div>
            <button
              onClick={toggle}
              title="Hide Guide"
              className="flex items-center justify-center h-7 w-7 rounded-md text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
            >
              <PanelRightClose className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 guide-scroll">
            <ToneCard />
            <LengthCard />
            <StoryBeatCard />
            <SuggestionsCard />
          </div>
        </>
      )}
    </div>
  );
}
