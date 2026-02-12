"use client";

import { useState } from "react";
import { X, Play, Pause, Clock } from "lucide-react";

interface PracticeModeProps {
  vowText: string;
  readingTime: string;
  onClose: () => void;
}

export function PracticeMode({
  vowText,
  readingTime,
  onClose,
}: PracticeModeProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Split text into paragraphs for ceremony-script formatting
  const paragraphs = vowText
    .split(/\n\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-sand-50">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-serif font-semibold text-base-900">
            Practice Mode
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-base-400">
            <Clock className="h-4 w-4" />
            <span>{readingTime}</span>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-full text-base-400 transition-colors hover:bg-sand-100 hover:text-base-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content — teleprompter style */}
      <div className="flex-1 overflow-y-auto relative">
        {/* Top fade */}
        <div className="sticky top-0 h-12 bg-linear-to-b from-sand-50 to-transparent pointer-events-none z-10" />

        <div className="max-w-2xl mx-auto px-8 py-12">
          <h3 className="text-center text-sm uppercase tracking-widest text-base-400 mb-12">
            Your Wedding Vows
          </h3>

          <div className="space-y-8">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-2xl font-serif leading-relaxed text-base-800 text-center"
                >
                  {paragraph}
                </p>
              ))
            ) : (
              <p className="text-2xl font-serif leading-relaxed text-base-400 text-center italic">
                Start writing your vows to see them here…
              </p>
            )}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="sticky bottom-0 h-12 bg-linear-to-t from-sand-50 to-transparent pointer-events-none z-10" />
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center px-6 py-6 border-t border-base-200">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 rounded-full bg-accent-500 px-8 py-3 text-base font-medium text-white shadow-md transition-colors hover:bg-accent-600"
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5 fill-current" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5 fill-current" />
              Start
            </>
          )}
        </button>
      </div>
    </div>
  );
}
