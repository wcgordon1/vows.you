"use client";

import { Heart, Flag, Frame, ChevronRight } from "lucide-react";

const BEATS = [
  {
    icon: Heart,
    iconColor: "text-red-500",
    iconBg: "bg-red-50",
    label: "The first moment you knew",
  },
  {
    icon: Flag,
    iconColor: "text-red-400",
    iconBg: "bg-red-50",
    label: "A challenge you overcame",
  },
  {
    icon: Frame,
    iconColor: "text-blue-500",
    iconBg: "bg-blue-50",
    label: "A promise about the future",
  },
] as const;

export function StoryBeatCard() {
  return (
    <div className="rounded-lg border border-base-200 bg-white p-3.5">
      <h3 className="text-xs font-semibold text-base-700 uppercase tracking-wide mb-2">
        Add a Story Beat
      </h3>
      <div className="space-y-0.5">
        {BEATS.map((beat) => {
          const Icon = beat.icon;
          return (
            <button
              key={beat.label}
              className="group flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-left text-[13px] text-base-600 transition-colors hover:bg-sand-50 active:bg-sand-100"
            >
              <span
                className={`flex items-center justify-center h-5.5 w-5.5 rounded ${beat.iconBg} shrink-0`}
              >
                <Icon className={`h-3 w-3 ${beat.iconColor}`} />
              </span>
              <span className="flex-1 truncate">{beat.label}</span>
              <ChevronRight className="h-3 w-3 text-base-300 group-hover:text-base-500 transition-colors shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
