"use client";

import { useState, useEffect } from "react";
import { PanelRightClose, PanelRightOpen, Lock } from "lucide-react";
import { ToneCard } from "./tone-card";
import { LengthCard } from "./length-card";
import { StoryBeatCard } from "./story-beat-card";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    function handler(e: MediaQueryListEvent) {
      setMatches(e.matches);
    }
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

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

            {/* Tasteful upgrade hint */}
            <div className="rounded-lg border border-dashed border-base-200 bg-sand-50/60 p-3.5 mt-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Lock className="h-3 w-3 text-accent-500" />
                <span className="text-xs font-semibold text-base-700">
                  AI Suggestions
                </span>
              </div>
              <p className="text-[11px] text-base-400 leading-relaxed">
                Get personalized prompts and tone analysis tailored to your
                story.
              </p>
              <button className="mt-2 text-[11px] font-medium text-accent-600 hover:text-accent-700 transition-colors">
                Upgrade to unlock
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
