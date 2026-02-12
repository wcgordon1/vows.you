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
import { useAutosave } from "../hooks/use-autosave";

const PROMPT_CHIPS = [
  "How you met",
  "A favorite memory",
  "What you admire",
  "A promise",
] as const;

export function TiptapEditor() {
  const [isFocused, setIsFocused] = useState(false);
  const { activeDraft, state } = useWorkspace();
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
        placeholder: "Start writing your vows…",
      }),
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

  // ── Load draft content when active draft changes ──────────────────────

  useEffect(() => {
    if (!editor || !activeDraft) return;

    // Only reload if we're switching to a different draft
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
    (text: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .setContent(`<p>${text}…</p>`)
        .run();
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

        {/* Empty state prompt chips */}
        {isEmpty && !isFocused && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-10 pointer-events-none">
            <p className="text-sm text-base-400 mb-3">Start with…</p>
            <div className="flex flex-wrap gap-2 justify-center pointer-events-auto">
              {PROMPT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => insertPrompt(chip)}
                  className="rounded-full border border-base-200 bg-white px-3.5 py-1.5 text-xs font-medium text-base-500 shadow-sm transition-colors hover:bg-sand-50 hover:text-base-700 hover:border-base-300"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <EditorFooter editor={editor} />
    </div>
  );
}

export type { Editor };
