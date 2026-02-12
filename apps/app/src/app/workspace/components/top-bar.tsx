"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import { Logo } from "./logo";

type SaveStatus = "idle" | "saving" | "saved" | "offline";

export function TopBar() {
  const [title, setTitle] = useState("Untitled");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
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

    // Simulate save cycle: saving → saved → idle
    setSaveStatus("saving");
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      setSaveStatus("saved");
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") inputRef.current?.blur();
    if (e.key === "Escape") setIsEditing(false);
  }

  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved just now",
    offline: "Offline",
  };

  return (
    <header className="flex items-center justify-between border-b border-base-200 bg-sand-50/80 backdrop-blur-sm px-5 py-2.5 shrink-0">
      {/* Left — Logo */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <Logo className="h-5 w-5 text-accent-600" />
        <span className="text-base font-serif font-semibold text-base-900 tracking-tight leading-none translate-y-[0.5px]">
          Vows
        </span>
      </div>

      {/* Center — Draft title + status */}
      <div className="flex flex-col items-center gap-0.5">
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
            className="group flex items-center gap-1.5 rounded-lg px-3 py-1 transition-colors hover:bg-sand-100"
          >
            <span className="text-[11px] uppercase tracking-wider text-base-400 font-medium mr-1">
              Draft
            </span>
            <span className="text-sm font-medium text-base-800">{title}</span>
            <ChevronDown className="h-3 w-3 text-base-400 group-hover:text-base-600 transition-colors" />
          </button>
        )}
        <span
          className={`text-[11px] h-3.5 leading-none transition-opacity duration-300 ${
            saveStatus === "saving"
              ? "text-accent-500 opacity-100"
              : saveStatus === "saved"
                ? "text-base-400 opacity-100"
                : saveStatus === "offline"
                  ? "text-red-400 opacity-100"
                  : "opacity-0"
          }`}
        >
          {statusLabel[saveStatus] || "\u00A0"}
        </span>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5 min-w-[140px] justify-end">
        <button className="flex items-center gap-1.5 rounded-full border border-base-200 bg-white px-3.5 py-1.5 text-xs font-medium text-base-700 shadow-sm transition-colors hover:bg-sand-50 hover:border-base-300">
          <Plus className="h-3 w-3" />
          New Draft
        </button>
        <button
          title="More"
          className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-7 w-7",
            },
          }}
        />
      </div>
    </header>
  );
}
