"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { ChevronDown, Plus, MoreHorizontal, Pencil } from "lucide-react";
import { Logo } from "./logo";

type SaveStatus = "idle" | "saving" | "saved" | "offline";

export function TopBar() {
  const [title, setTitle] = useState("Untitled");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const renameRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setIsRenaming(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  function commitRename() {
    setIsRenaming(false);
    setShowDropdown(false);
    if (!title.trim()) setTitle("Untitled");
    setSaveStatus("saving");
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => {
      setSaveStatus("saved");
      savedTimerRef.current = setTimeout(() => setSaveStatus("idle"), 2000);
    }, 400);
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") {
      setIsRenaming(false);
      setShowDropdown(false);
    }
  }

  const statusText =
    saveStatus === "saving"
      ? "Saving\u2026"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "offline"
          ? "Offline"
          : null;

  return (
    <header className="relative z-40 grid h-12 grid-cols-[1fr_auto_1fr] items-center border-b border-base-200 bg-sand-50/80 backdrop-blur-sm px-5 shrink-0">
      {/* Left — Logo */}
      <div className="flex items-center gap-2">
        <Logo className="h-5 w-5 text-accent-600" />
        <span className="text-base font-serif font-semibold text-base-900 tracking-tight">
          Vows
        </span>
      </div>

      {/* Center — Title pill, vertically centered, dropdown anchored below */}
      <div className="relative flex items-center justify-center" ref={dropdownRef}>
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            setIsRenaming(false);
          }}
          className="group flex items-center gap-1.5 rounded-full px-3.5 py-1 transition-colors hover:bg-sand-100"
        >
          <span className="text-sm font-medium text-base-800 leading-none">
            {title}
          </span>
          {statusText && (
            <>
              <span className="text-base-300">·</span>
              <span
                className={`text-[11px] leading-none ${
                  saveStatus === "offline" ? "text-red-400" : "text-base-400"
                }`}
              >
                {statusText}
              </span>
            </>
          )}
          <ChevronDown className="h-3 w-3 text-base-300 group-hover:text-base-500 transition-colors" />
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute left-1/2 top-full z-50 mt-2 w-52 -translate-x-1/2 rounded-lg border border-base-200 bg-white py-1 shadow-lg">
            {isRenaming ? (
              <div className="px-3 py-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-base-400 mb-1.5">
                  Rename draft
                </label>
                <input
                  ref={renameRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  className="w-full rounded-md border border-base-200 bg-white px-2.5 py-1.5 text-sm text-base-800 outline-none focus:border-base-300 focus:ring-1 focus:ring-base-200"
                />
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b border-base-100">
                  <p className="text-[11px] uppercase tracking-wider text-base-400 font-medium">
                    Draft
                  </p>
                  <p className="text-sm font-medium text-base-800 mt-0.5 truncate">
                    {title}
                  </p>
                </div>
                <button
                  onClick={() => setIsRenaming(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-base-600 hover:bg-sand-50 transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Rename
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5 justify-end">
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
