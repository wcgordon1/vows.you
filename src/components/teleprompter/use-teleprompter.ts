import { useReducer, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  SpeedPreset,
  TeleprompterState,
  TeleprompterAction,
  WordMeta,
} from "../../lib/teleprompter/types";
import { WPM_PRESETS } from "../../lib/teleprompter/types";
import {
  buildWordTimings,
  totalDurationMs,
  wordIndexAtTime,
} from "../../lib/teleprompter/word-timing";

function reducer(
  state: TeleprompterState,
  action: TeleprompterAction,
): TeleprompterState {
  switch (action.type) {
    case "PLAY":
      return { ...state, isPlaying: true };
    case "PAUSE":
      return { ...state, isPlaying: false };
    case "RESTART":
      return { ...state, isPlaying: false, currentWordIndex: 0, elapsedMs: 0 };
    case "TICK": {
      const newElapsed = state.elapsedMs + action.deltaMs;
      const newIndex = Math.min(action.wordCount - 1, state.currentWordIndex);
      return { ...state, elapsedMs: newElapsed, currentWordIndex: newIndex };
    }
    case "SET_SPEED":
      return { ...state, speedPreset: action.preset };
    case "SEEK_WORD":
      return { ...state, currentWordIndex: action.index };
    case "TOGGLE_MIRROR":
      return { ...state, isMirrored: !state.isMirrored };
    case "SET_FULLSCREEN":
      return { ...state, isFullscreen: action.active };
    default:
      return state;
  }
}

const FOCUS_LINE_FRACTION = 0.38;

export function useTeleprompter(words: string[]) {
  const [state, dispatch] = useReducer(reducer, {
    isPlaying: false,
    currentWordIndex: 0,
    speedPreset: "medium",
    elapsedMs: 0,
    isMirrored: false,
    isFullscreen: false,
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastFrameRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);

  const wpm = WPM_PRESETS[state.speedPreset];
  const timings: WordMeta[] = useMemo(() => buildWordTimings(words, wpm), [words, wpm]);
  const totalMs = useMemo(() => totalDurationMs(timings), [timings]);

  // Keep elapsedRef in sync with state for rAF reads
  useEffect(() => {
    elapsedRef.current = state.elapsedMs;
  }, [state.elapsedMs]);

  // ── rAF playback loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.isPlaying || words.length === 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    lastFrameRef.current = performance.now();

    const tick = (now: number) => {
      const delta = now - lastFrameRef.current;
      lastFrameRef.current = now;

      const newElapsed = elapsedRef.current + delta;
      elapsedRef.current = newElapsed;

      if (newElapsed >= totalMs) {
        dispatch({ type: "PAUSE" });
        dispatch({ type: "TICK", deltaMs: delta, wordCount: words.length });
        return;
      }

      const idx = wordIndexAtTime(timings, newElapsed);
      dispatch({ type: "SEEK_WORD", index: idx });
      dispatch({ type: "TICK", deltaMs: delta, wordCount: words.length });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [state.isPlaying, words.length, timings, totalMs]);

  // ── Scroll active word to focus line ──────────────────────────────────────
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeEl = container.querySelector(
      `[data-w="${state.currentWordIndex}"]`,
    ) as HTMLElement | null;
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const focusLineY = containerRect.height * FOCUS_LINE_FRACTION;
    const activeRect = activeEl.getBoundingClientRect();
    const activeOffsetInContainer = activeRect.top - containerRect.top;

    const targetScrollTop =
      container.scrollTop + activeOffsetInContainer - focusLineY;

    container.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "smooth",
    });
  }, [state.currentWordIndex]);

  // ── Fullscreen API ────────────────────────────────────────────────────────
  const fullscreenRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = useCallback(async () => {
    const el = fullscreenRef.current;
    if (!el) return;

    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        dispatch({ type: "SET_FULLSCREEN", active: true });
      } else {
        await document.exitFullscreen();
        dispatch({ type: "SET_FULLSCREEN", active: false });
      }
    } catch {
      // Fullscreen API not supported or denied
    }
  }, []);

  useEffect(() => {
    const handler = () => {
      dispatch({ type: "SET_FULLSCREEN", active: !!document.fullscreenElement });
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
  const play = useCallback(() => dispatch({ type: "PLAY" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const restart = useCallback(() => {
    elapsedRef.current = 0;
    dispatch({ type: "RESTART" });
  }, []);
  const setSpeed = useCallback(
    (preset: SpeedPreset) => dispatch({ type: "SET_SPEED", preset }),
    [],
  );
  const togglePlayPause = useCallback(() => {
    dispatch(state.isPlaying ? { type: "PAUSE" } : { type: "PLAY" });
  }, [state.isPlaying]);
  const toggleMirror = useCallback(() => dispatch({ type: "TOGGLE_MIRROR" }), []);

  return {
    ...state,
    wpm,
    timings,
    totalMs,
    scrollContainerRef,
    fullscreenRef,
    focusLineFraction: FOCUS_LINE_FRACTION,
    play,
    pause,
    restart,
    setSpeed,
    togglePlayPause,
    toggleMirror,
    toggleFullscreen,
  };
}
