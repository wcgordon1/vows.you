"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useMediaQuery } from "../hooks/use-media-query";
import { NextStepModule } from "./next-step-module";
import { ToneCard } from "./tone-card";
import { LengthCard } from "./length-card";
import { OutlineCard } from "./outline-card";
import { StoryBeatCard } from "./story-beat-card";
import { CoachNotesCard } from "./coach-notes-card";

export function GuidePanel() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [manualCollapsed, setManualCollapsed] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const collapsed = manualCollapsed ?? isMobile;

  function toggle() {
    setManualCollapsed(!collapsed);
  }

  useEffect(() => {
    setManualCollapsed(null);
  }, [isMobile]);

  const scrollTo = useCallback(
    (section: "outlines" | "beats" | "notes") => {
      const el = scrollRef.current?.querySelector(
        `[data-guide-section="${section}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

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
                Your vow-writing coach
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

          {/* Sticky Coach Notes */}
          <div className="px-3 pt-3 pb-1" data-guide-section="notes">
            <CoachNotesCard />
          </div>

          {/* Scrollable cards */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3 space-y-2.5 guide-scroll"
          >
            <NextStepModule onScrollTo={scrollTo} />
            <ToneCard />
            <LengthCard />

            <div data-guide-section="outlines">
              <OutlineCard />
            </div>

            <div data-guide-section="beats">
              <StoryBeatCard />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
