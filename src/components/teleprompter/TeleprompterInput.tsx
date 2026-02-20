import { useState, useCallback } from "react";
import { Play } from "lucide-react";
import { encodeText } from "../../lib/teleprompter/compression";
import { countWordsInText } from "../../lib/teleprompter/word-timing";

const PLACEHOLDER = `Paste or type your vows here…

You can use plain text, **Markdown**, or [b]BBCode[/b] formatting.`;

export default function TeleprompterInput() {
  const [text, setText] = useState("");
  const wordCount = text.trim() ? countWordsInText(text) : 0;
  const isEmpty = !text.trim();

  const handlePractice = useCallback(() => {
    if (isEmpty) return;
    const url = encodeText(text);
    window.location.href = url;
  }, [text, isEmpty]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handlePractice();
      }
    },
    [handlePractice],
  );

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={PLACEHOLDER}
          spellCheck
          className="w-full h-[320px] md:h-[400px] rounded-2xl border border-base-200 bg-white p-6 text-base leading-relaxed font-serif text-base-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500/30 resize-none overflow-y-auto placeholder:text-base-400 placeholder:font-sans"
        />
        {/* Character / word count */}
        <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-base-400 pointer-events-none">
          {wordCount > 0 && (
            <>
              <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
              <span className="w-px h-3 bg-base-200" />
              <span>{text.length.toLocaleString()} chars</span>
            </>
          )}
        </div>
      </div>

      {/* Format hint */}
      <p className="text-sm text-base-400">
        Supports plain text, Markdown (<code className="text-base-500">**bold**</code>, <code className="text-base-500">*italic*</code>, <code className="text-base-500"># headings</code>), and BBCode formatting.
        Press <kbd className="px-1.5 py-0.5 rounded bg-sand-100 text-base-500 text-xs font-mono">⌘ Enter</kbd> to start.
      </p>

      {/* CTA */}
      <button
        onClick={handlePractice}
        disabled={isEmpty}
        className="inline-flex items-center gap-2.5 rounded-full bg-accent-500 px-8 py-3.5 text-base font-medium text-white shadow-md transition-all hover:bg-accent-600 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent-500 disabled:hover:shadow-md"
      >
        <Play className="h-5 w-5 fill-current" />
        Practice Reading
      </button>
    </div>
  );
}
