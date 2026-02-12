"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { ChevronDown, Plus } from "lucide-react";
import { Logo } from "./logo";

export function TopBar() {
  const [title, setTitle] = useState("Untitled");
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleBlur() {
    setIsEditing(false);
    if (!title.trim()) setTitle("Untitled");

    // Show "Saved just now" briefly
    setShowSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setShowSaved(false), 2500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
    }
  }

  return (
    <header className="flex items-center justify-between border-b border-base-200 bg-sand-50 px-4 py-3 shrink-0">
      {/* Left — Logo */}
      <div className="flex items-center gap-2 min-w-[160px]">
        <Logo className="h-5 w-5 text-accent-600" />
        <span className="text-lg font-serif font-semibold text-base-900 tracking-tight">
          Vows
        </span>
      </div>

      {/* Center — Draft title + saved indicator */}
      <div className="flex flex-col items-center">
        {isEditing ? (
          <input
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="rounded-lg border border-base-300 bg-white px-3 py-1 text-sm font-medium text-base-800 text-center outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400 w-56"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium text-base-800 transition-colors hover:bg-sand-100"
          >
            <span>{title}</span>
            <ChevronDown className="h-3.5 w-3.5 text-base-400" />
          </button>
        )}
        <span
          className={`text-xs text-base-400 mt-0.5 transition-opacity duration-300 ${
            showSaved ? "opacity-100" : "opacity-0"
          }`}
        >
          Saved just now
        </span>
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
