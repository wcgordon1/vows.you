"use client";

import { useReducer, useEffect, useRef, useCallback } from "react";
import {
  type Segment,
  type SpeedPreset,
  WPM_PRESETS,
  computeSegmentDuration,
} from "../lib/vow-utils";

// ─── State ───────────────────────────────────────────────────────────────────

interface TeleprompterState {
  isPlaying: boolean;
  currentIndex: number;
  speedPreset: SpeedPreset;
}

type TeleprompterAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESTART" }
  | { type: "NEXT_SEGMENT"; segmentCount: number }
  | { type: "SET_SPEED"; preset: SpeedPreset };

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
      return { ...state, isPlaying: false, currentIndex: 0 };
    case "NEXT_SEGMENT": {
      const next = state.currentIndex + 1;
      if (next >= action.segmentCount) {
        // Reached the end — pause at last segment
        return { ...state, isPlaying: false };
      }
      return { ...state, currentIndex: next };
    }
    case "SET_SPEED":
      return { ...state, speedPreset: action.preset };
    default:
      return state;
  }
}

// ─── Focus line position (fraction of container height) ──────────────────────

const FOCUS_LINE_FRACTION = 0.42;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTeleprompter(segments: Segment[]) {
  const [state, dispatch] = useReducer(reducer, {
    isPlaying: false,
    currentIndex: 0,
    speedPreset: "medium",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isPlaying, currentIndex, speedPreset } = state;
  const wpm = WPM_PRESETS[speedPreset];

  // ── Playback timer ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying || segments.length === 0) return;

    const segment = segments[currentIndex];
    if (!segment) return;

    const duration = computeSegmentDuration(segment, wpm);

    timerRef.current = setTimeout(() => {
      dispatch({ type: "NEXT_SEGMENT", segmentCount: segments.length });
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, currentIndex, wpm, segments]);

  // ── Scroll to active segment ────────────────────────────────────────────────

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const activeEl = container.querySelector(
      `[data-segment-index="${currentIndex}"]`,
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
  }, [currentIndex]);

  // ── Actions ─────────────────────────────────────────────────────────────────

  const play = useCallback(() => dispatch({ type: "PLAY" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const restart = useCallback(() => dispatch({ type: "RESTART" }), []);
  const setSpeed = useCallback(
    (preset: SpeedPreset) => dispatch({ type: "SET_SPEED", preset }),
    [],
  );
  const togglePlayPause = useCallback(() => {
    dispatch(isPlaying ? { type: "PAUSE" } : { type: "PLAY" });
  }, [isPlaying]);

  return {
    isPlaying,
    currentIndex,
    speedPreset,
    scrollContainerRef,
    focusLineFraction: FOCUS_LINE_FRACTION,
    play,
    pause,
    restart,
    setSpeed,
    togglePlayPause,
  };
}
