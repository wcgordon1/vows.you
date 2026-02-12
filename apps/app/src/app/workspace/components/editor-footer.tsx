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
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function getReadingTime(wordCount: number): string {
  const minutes = Math.ceil(wordCount / 150); // spoken pace ~150 wpm for vows
  if (minutes < 1) return "< 1 min";
  return `~ ${minutes} min`;
}

export function EditorFooter({ editor }: EditorFooterProps) {
  const [showPractice, setShowPractice] = useState(false);
  const wordCount = getWordCount(editor);
  const readingTime = getReadingTime(wordCount);

  // Extract plain text for practice mode
  const vowText = editor?.state.doc.textContent ?? "";

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-t border-base-200">
        {/* Left — Stats */}
        <div className="text-sm text-base-400">
          {wordCount} words &nbsp;&middot;&nbsp; {readingTime}
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-full border border-base-200 bg-white px-4 py-1.5 text-sm font-medium text-base-600 transition-colors hover:bg-sand-50 hover:border-base-300">
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            onClick={() => setShowPractice(true)}
            className="flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-600"
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
