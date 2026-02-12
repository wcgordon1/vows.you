"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFooter } from "./editor-footer";
import { useWorkspace } from "../hooks/use-workspace";
import { useAutosave } from "../hooks/use-autosave";
import { useVowAnalysis } from "../hooks/use-vow-analysis";
import { WeakPhraseHighlight } from "../extensions/weak-phrase-highlight";

export function TiptapEditor() {
  const [isFocused, setIsFocused] = useState(false);
  const { activeDraft, state, setVowAnalysis, setInsertHTML } = useWorkspace();
  const isPaid = state.hasPaidEntitlement;
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
        placeholder:
          "Start writing your vows…\n\nThink of one moment that still feels vivid.\n\nWhere you knew this was different.\n\nBegin there.",
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
      </div>

      <EditorFooter editor={editor} analysis={analysis} />
    </div>
  );
}

export type { Editor };
