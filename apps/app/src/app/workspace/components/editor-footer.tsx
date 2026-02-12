"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Eye, Play } from "lucide-react";
import { PracticeMode } from "./practice-mode";

interface EditorFooterProps {
  editor: Editor | null;
}

function getWordCount(editor: Editor | null): number {
  if (!editor) return 0;
  const text = editor.state.doc.textContent;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 150);
  if (minutes < 1) return "< 1 min";
  return `~ ${minutes} min`;
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const [showPractice, setShowPractice] = useState(false);
  const wordCount = getWordCount(editor);
  const readingTime = getReadingTime(wordCount);
  const vowText = editor?.state.doc.textContent ?? "";

  return (
    <>
      <div className="flex items-center justify-between px-8 py-3 border-t border-base-100">
        {/* Left — Stats */}
        <div className="text-xs font-medium text-base-500 tracking-wide">
          {wordCount} words &middot; {readingTime}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-base-500 transition-colors hover:bg-sand-100 hover:text-base-700">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            onClick={() => setShowPractice(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            Practice
          </button>
        </div>
      </div>

      {showPractice && (
        <PracticeMode
          vowText={vowText}
          readingTime={readingTime}
          onClose={() => setShowPractice(false)}
        />
      )}
    </>
  );
}
