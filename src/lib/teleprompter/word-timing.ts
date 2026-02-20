import type { WordMeta, SpeedPreset } from "./types";
import { WPM_PRESETS } from "./types";

// Punctuation pauses in milliseconds
const PAUSE_COMMA = 180;
const PAUSE_SEMICOLON = 220;
const PAUSE_PERIOD = 380;
const PAUSE_ELLIPSIS = 600;
const MIN_WORD_DURATION = 200;

function punctuationPauseMs(word: string): number {
  if (!word) return 0;
  const last = word.trimEnd();
  if (/\.{3}|…/.test(last)) return PAUSE_ELLIPSIS;
  if (/[.!?]$/.test(last)) return PAUSE_PERIOD;
  if (/[;:]$/.test(last)) return PAUSE_SEMICOLON;
  if (/,$/.test(last)) return PAUSE_COMMA;
  return 0;
}

export function computeWordDuration(word: string, wpm: number): number {
  const baseMs = (60 / wpm) * 1000;
  return Math.max(baseMs + punctuationPauseMs(word), MIN_WORD_DURATION);
}

export function buildWordTimings(words: string[], wpm: number): WordMeta[] {
  let cumulative = 0;
  return words.map((word, index) => {
    const durationMs = computeWordDuration(word, wpm);
    const meta: WordMeta = { index, durationMs, cumulativeMs: cumulative };
    cumulative += durationMs;
    return meta;
  });
}

export function totalDurationMs(timings: WordMeta[]): number {
  if (timings.length === 0) return 0;
  const last = timings[timings.length - 1];
  return last.cumulativeMs + last.durationMs;
}

export function wordIndexAtTime(timings: WordMeta[], elapsedMs: number): number {
  if (timings.length === 0) return 0;
  // Binary search for the word whose cumulative range contains elapsedMs
  let lo = 0;
  let hi = timings.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >>> 1;
    if (timings[mid].cumulativeMs <= elapsedMs) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo;
}

export function estimateSpeakingTime(
  wordCount: number,
  wpm: number = WPM_PRESETS.medium,
): string {
  if (wordCount === 0) return "0 min";
  const minutes = Math.round((wordCount / wpm));
  if (minutes < 1) return "~1 min";
  return `~${minutes} min`;
}

export function countWordsInText(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
