"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFooter } from "./editor-footer";
import { useWorkspace } from "../hooks/use-workspace";
import { useMediaQuery } from "../hooks/use-media-query";
import { useAutosave } from "../hooks/use-autosave";
import { useVowAnalysis } from "../hooks/use-vow-analysis";
import { WeakPhraseHighlight } from "../extensions/weak-phrase-highlight";

const PROMPT_CHIPS: { label: string; content: string }[] = [
  {
    label: "How you met",
    content: [
      "<p>The first time I saw you, I remember…</p>",
      "<p>I knew something was different when…</p>",
      "<p>Looking back on that moment now, I realize…</p>",
    ].join(""),
  },
  {
    label: "A favorite memory",
    content: [
      "<p>One of my favorite memories with you is…</p>",
      "<p>What made that moment special was…</p>",
      "<p>Every time I think about it, I feel…</p>",
    ].join(""),
  },
  {
    label: "What you admire",
    content: [
      "<p>One of the things I love most about you is…</p>",
      "<p>You have this way of making everyone around you feel…</p>",
      "<p>Your strength and kindness inspire me to…</p>",
    ].join(""),
  },
  {
    label: "A promise",
    content: [
      "<p>I promise to always…</p>",
      "<p>Even when things get hard, I will…</p>",
      "<p>Together, I know we can…</p>",
    ].join(""),
  },
];

const PLACEHOLDER_FULL =
  "Start writing your vows…\n\nThink of one moment that still feels vivid.\n\nWhere you knew this was different.\n\nBegin there.";
const PLACEHOLDER_SHORT = "Start writing your vows…";

export function TiptapEditor() {
  const [isFocused, setIsFocused] = useState(false);
  const { activeDraft, state, setVowAnalysis, setInsertHTML } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;
  const isMobile = useMediaQuery("(max-width: 767px)");
  const loadedDraftIdRef = useRef<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent-600 underline underline-offset-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Placeholder.configure({
        placeholder: isMobile ? PLACEHOLDER_SHORT : PLACEHOLDER_FULL,
      }),
      WeakPhraseHighlight,
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none font-serif text-base-800 focus:outline-none min-h-[420px] px-10 py-8",
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  // ── Bridge: expose insertHTML to workspace context ──────────────────────

  useEffect(() => {
    if (!editor) return;

    setInsertHTML((html: string, opts?: { replace?: boolean }) => {
      if (opts?.replace) {
        editor.chain().focus().setContent(html).run();
      } else {
        // Append at end
        editor.chain().focus("end").insertContent(html).run();
      }
    });
  }, [editor, setInsertHTML]);

  // ── Vow analysis (auto-runs on content changes) ────────────────────────

  const analysis = useVowAnalysis(editor);

  // Push analysis results to workspace context (for CoachNotesCard)
  useEffect(() => {
    setVowAnalysis(analysis);
  }, [analysis, setVowAnalysis]);

  // Apply inline highlights for paid users only
  useEffect(() => {
    if (!editor) return;

    if (isPaid && analysis.spans.length > 0) {
      editor.commands.setWeakPhraseSpans(analysis.spans);
    } else {
      editor.commands.clearWeakPhraseSpans();
    }
  }, [editor, isPaid, analysis.spans]);

  // ── Load draft content when active draft changes ──────────────────────

  useEffect(() => {
    if (!editor || !activeDraft) return;

    if (loadedDraftIdRef.current === activeDraft.id) return;
    loadedDraftIdRef.current = activeDraft.id;

    if (activeDraft.tiptapJSON) {
      editor.commands.setContent(activeDraft.tiptapJSON);
    } else {
      editor.commands.clearContent();
    }
  }, [editor, activeDraft]);

  // ── Autosave ──────────────────────────────────────────────────────────

  useAutosave(editor);

  // ── UI ────────────────────────────────────────────────────────────────

  const isEmpty = !editor || editor.state.doc.textContent.trim().length === 0;

  const insertPrompt = useCallback(
    (html: string) => {
      if (!editor) return;
      editor.chain().focus().setContent(html).run();
    },
    [editor],
  );

  // Show loading state while drafts load
  if (!state.isLoaded) {
    return (
      <div className="flex flex-col flex-1 min-h-0 items-center justify-center">
        <p className="text-sm text-base-400">Loading your drafts…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EditorToolbar editor={editor} visible={isFocused || !isEmpty} />

      <div className="flex-1 overflow-y-auto relative">
        <EditorContent editor={editor} />

        {/* Empty-state prompt chips */}
        {isEmpty && !isFocused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 pointer-events-none">
            <p className="text-sm text-base-400 mb-3">Start with…</p>
            <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => insertPrompt(chip.content)}
                  className="rounded-full border border-base-200 bg-white px-3.5 py-1.5 text-xs font-medium text-base-500 shadow-sm transition-colors hover:bg-sand-50 hover:text-base-700 hover:border-base-300"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditorFooter editor={editor} analysis={analysis} />
    </div>
  );
}

export type { Editor };
