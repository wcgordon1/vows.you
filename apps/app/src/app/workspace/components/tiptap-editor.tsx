"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFooter } from "./editor-footer";

const DEMO_CONTENT = `<h2>Your Wedding Vows</h2><p>When I think about the first time we met,<br>I still remember how nervous I felt…</p><p>You turned that nervousness into laughter.<br>And laughter into something steady.</p><p>Today, I promise…</p>`;

const PROMPT_CHIPS = [
  "How you met",
  "A favorite memory",
  "What you admire",
  "A promise",
] as const;

export function TiptapEditor() {
  const [isFocused, setIsFocused] = useState(false);

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
    content: DEMO_CONTENT,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none font-serif text-base-800 focus:outline-none min-h-[420px] px-10 py-8",
      },
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const isEmpty = !editor || editor.state.doc.textContent.trim().length === 0;

  const insertPrompt = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.chain().focus().setContent(`<h2>Your Wedding Vows</h2><p>${text}…</p>`).run();
    },
    [editor],
  );

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
