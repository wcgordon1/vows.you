"use client";

import { useState, useRef, useEffect } from "react";
import { UserButton, SignInButton } from "@clerk/nextjs";
import {
  ChevronDown,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  FileDown,
  Sparkles,
  LogIn,
} from "lucide-react";
import { Logo } from "./logo";
import { useWorkspace } from "../hooks/use-workspace";
import { useMediaQuery } from "../hooks/use-media-query";
import { getDraftLimit } from "../lib/entitlements";
import { track } from "../lib/analytics";

export function TopBar() {
  const {
    state,
    activeDraft,
    isSignedIn,
    createDraft,
    switchDraft,
    renameDraft,
    deleteDraft,
    requestAction,
    setShowUpgradeCard,
  } = useWorkspace();

  const { drafts, saveStatus, hasPaidEntitlement, showUpgradeCard } = state;

  const [showDropdown, setShowDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const renameRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const title = activeDraft?.title ?? "Untitled";
  const draftLimit = getDraftLimit(isSignedIn, hasPaidEntitlement);

  // ── Focus rename input ──────────────────────────────────────────────────

  useEffect(() => {
    if (isRenaming && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [isRenaming]);

  // ── Close dropdown on outside click ─────────────────────────────────────

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setIsRenaming(false);
        setShowUpgradeCard(false);
      }
    }
    if (showDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showDropdown, setShowUpgradeCard]);

  // ── Close more-menu on outside click ────────────────────────────────────

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    if (showMoreMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMoreMenu]);

  // ── Handlers ────────────────────────────────────────────────────────────

  function startRename() {
    setRenameValue(title);
    setIsRenaming(true);
  }

  function commitRename() {
    setIsRenaming(false);
    const trimmed = renameValue.trim() || "Untitled";
    if (activeDraft && trimmed !== activeDraft.title) {
      renameDraft(activeDraft.id, trimmed);
    }
  }

  function handleRenameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      commitRename();
      setShowDropdown(false);
    }
    if (e.key === "Escape") {
      setIsRenaming(false);
      setShowDropdown(false);
    }
  }

  function handleDelete(id: string) {
    deleteDraft(id);
    setShowDropdown(false);
  }

  function handleNewDraft() {
    setShowDropdown(false);
    createDraft();
  }

  function handleMoreRename() {
    setShowMoreMenu(false);
    setShowDropdown(true);
    startRename();
  }

  function handleMoreDelete() {
    setShowMoreMenu(false);
    if (activeDraft) handleDelete(activeDraft.id);
  }

  function handleMoreExport() {
    setShowMoreMenu(false);
    track({ event: "export_clicked" });
    requestAction("EXPORT_PDF");
  }

  // ── Status text ─────────────────────────────────────────────────────────

  const statusText =
    saveStatus === "saving"
      ? "Saving\u2026"
      : saveStatus === "saved"
        ? "Saved"
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

      {/* Center — Title pill + dropdown */}
      <div
        className="relative flex items-center justify-center"
        ref={dropdownRef}
      >
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            setIsRenaming(false);
            setShowUpgradeCard(false);
          }}
          className="group flex items-center gap-1.5 rounded-full px-3.5 py-1 transition-colors hover:bg-sand-100"
        >
          <span className="text-sm font-medium text-base-800 leading-none">
            {title}
          </span>
          {statusText && (
            <>
              <span className="text-base-300">&middot;</span>
              <span className="text-[11px] leading-none text-base-400">
                {statusText}
              </span>
            </>
          )}
          <ChevronDown className="h-3 w-3 text-base-300 group-hover:text-base-500 transition-colors" />
        </button>

        {/* ── Dropdown ─────────────────────────────────────────────────── */}
        {showDropdown && (
          <div className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-base-200 bg-white py-1 shadow-lg">
            {isRenaming ? (
              /* ── Rename mode ─────────────────────────────────────────── */
              <div className="px-3 py-2">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-base-400 mb-1.5">
                  Rename draft
                </label>
                <input
                  ref={renameRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={handleRenameKeyDown}
                  className="w-full rounded-md border border-base-200 bg-white px-2.5 py-1.5 text-sm text-base-800 outline-none focus:border-base-300 focus:ring-1 focus:ring-base-200"
                />
              </div>
            ) : (
              <>
                {/* ── Draft list ─────────────────────────────────────── */}
                <div className="px-3 py-2 border-b border-base-100">
                  <p className="text-[11px] uppercase tracking-wider text-base-400 font-medium">
                    Drafts
                    {draftLimit !== null && (
                      <span className="ml-1">
                        ({drafts.length}/{draftLimit})
                      </span>
                    )}
                  </p>
                </div>

                <div className="max-h-48 overflow-y-auto py-1">
                  {drafts.map((draft) => {
                    const isActive = draft.id === activeDraft?.id;
                    return (
                      <div
                        key={draft.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          switchDraft(draft.id);
                          setShowDropdown(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            switchDraft(draft.id);
                            setShowDropdown(false);
                          }
                        }}
                        className={`flex items-center gap-2 w-full px-3 py-2 text-[13px] transition-colors cursor-pointer ${
                          isActive
                            ? "bg-sand-50 text-base-900 font-medium"
                            : "text-base-600 hover:bg-sand-50"
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-base-400" />
                        <span className="truncate flex-1 text-left">
                          {draft.title}
                        </span>
                        {isActive && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startRename();
                              }}
                              className="p-0.5 rounded text-base-400 hover:text-base-600 transition-colors"
                              title="Rename"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            {drafts.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(draft.id);
                                }}
                                className="p-0.5 rounded text-base-400 hover:text-red-500 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ── Upgrade card (inline, shown when New Draft is blocked) */}
                {showUpgradeCard && (
                  <div className="mx-2 my-2 rounded-lg border border-accent-200 bg-accent-50/50 p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-accent-500" />
                      <span className="text-xs font-semibold text-base-800">
                        Upgrade to Complete
                      </span>
                    </div>
                    <p className="text-[11px] text-base-500 leading-relaxed mb-2">
                      Unlock unlimited drafts, PDF export, and more.
                    </p>
                    <button className="w-full rounded-full bg-accent-500 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-600">
                      Upgrade — $129
                    </button>
                  </div>
                )}

                {/* ── New Draft button ──────────────────────────────── */}
                <div className="border-t border-base-100 pt-1">
                  <button
                    onClick={handleNewDraft}
                    className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-base-600 hover:bg-sand-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    New Draft
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-1.5 justify-end">
        <button
          onClick={handleNewDraft}
          className="flex items-center gap-1.5 rounded-full border border-base-200 bg-white px-2.5 py-1.5 text-xs font-medium text-base-700 shadow-sm transition-colors hover:bg-sand-50 hover:border-base-300"
        >
          <Plus className="h-3 w-3" />
          {isMobile ? "" : "New Draft"}
        </button>

        {/* Three-dot more menu */}
        <div className="relative" ref={moreRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            title="More"
            className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-lg border border-base-200 bg-white py-1 shadow-lg">
              <button
                onClick={handleMoreRename}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-base-600 hover:bg-sand-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5 text-base-400" />
                Rename draft
              </button>
              <button
                onClick={handleMoreExport}
                className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-base-600 hover:bg-sand-50 transition-colors"
              >
                <FileDown className="h-3.5 w-3.5 text-base-400" />
                Export
              </button>
              {drafts.length > 1 && (
                <button
                  onClick={handleMoreDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete draft
                </button>
              )}
            </div>
          )}
        </div>

        {/* Auth: show UserButton when signed in, Sign In button when not */}
        {isSignedIn ? (
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-7 w-7",
              },
            }}
          />
        ) : (
          <SignInButton mode="modal">
            {isMobile ? (
              <button
                className="flex items-center justify-center h-8 w-8 rounded-full bg-base-900 text-white transition-colors hover:bg-base-800"
                title="Sign in"
              >
                <LogIn className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button className="rounded-full bg-base-900 px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-base-800">
                Sign in
              </button>
            )}
          </SignInButton>
        )}
      </div>
    </header>
  );
}
