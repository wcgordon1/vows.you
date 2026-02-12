"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "./editor-toolbar";
import { EditorFooter } from "./editor-footer";

const DEMO_CONTENT = `<h2>Your Wedding Vows</h2><p>When I think about the first time we met,<br>I still remember how nervous I felt…</p><p>You turned that nervousness into laughter.<br>And laughter into something steady.</p><p>Today, I promise…</p>`;

export function TiptapEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
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
          "prose prose-lg max-w-none font-serif text-base-800 focus:outline-none min-h-[400px] px-8 py-6",
      },
    },
  });

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
      <EditorFooter editor={editor} />
    </div>
  );
}

export type { Editor };
