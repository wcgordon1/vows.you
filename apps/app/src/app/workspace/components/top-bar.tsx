"use client";

import { UserButton } from "@clerk/nextjs";
import {
  ChevronDown,
  Plus,
  Sparkles,
} from "lucide-react";

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-base-200 bg-sand-50 px-4 py-3 shrink-0">
      {/* Left — Logo */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <Sparkles className="h-5 w-5 text-accent-600" />
        <span className="text-lg font-serif font-semibold text-base-900 tracking-tight">
          Vows
        </span>
      </div>

      {/* Center — Draft title + saved indicator */}
      <div className="flex flex-col items-center">
        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium text-base-800 transition-colors hover:bg-sand-100">
          <span>Emma &amp; Lucas &mdash; Draft 1</span>
          <ChevronDown className="h-3.5 w-3.5 text-base-400" />
        </button>
        <span className="text-xs text-base-400 mt-0.5">Saved just now</span>
      </div>

      {/* Right — Actions + Avatar */}
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        <button className="flex items-center gap-1.5 rounded-full border border-base-300 bg-white px-4 py-1.5 text-sm font-medium text-base-800 shadow-sm transition-colors hover:bg-sand-50">
          <Plus className="h-3.5 w-3.5" />
          New Draft
        </button>
        <button className="rounded-full px-3 py-1.5 text-sm font-medium text-accent-600 transition-colors hover:bg-accent-50">
          Upgrade
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
