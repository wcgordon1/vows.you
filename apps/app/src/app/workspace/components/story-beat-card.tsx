"use client";

import { Heart, Flag, Frame } from "lucide-react";

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
    <div className="rounded-lg border border-base-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-base-800 mb-2">
        Add a Story Beat
      </h3>
      <div className="space-y-0.5">
        {BEATS.map((beat) => {
          const Icon = beat.icon;
          return (
            <button
              key={beat.label}
              className="flex items-center gap-2.5 w-full rounded-lg px-2.5 py-2 text-left text-sm text-base-600 transition-colors hover:bg-sand-50"
            >
              <span
                className={`flex items-center justify-center h-6 w-6 rounded-md ${beat.iconBg}`}
              >
                <Icon className={`h-3.5 w-3.5 ${beat.iconColor}`} />
              </span>
              <span className="truncate">{beat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
