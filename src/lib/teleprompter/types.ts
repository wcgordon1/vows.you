export type SpeedPreset = "slow" | "medium" | "fast";

export const WPM_PRESETS: Record<SpeedPreset, number> = {
  slow: 100,
  medium: 130,
  fast: 160,
};

export const SPEED_OPTIONS: { key: SpeedPreset; label: string }[] = [
  { key: "slow", label: "Slow" },
  { key: "medium", label: "Medium" },
  { key: "fast", label: "Fast" },
];

export interface WordMeta {
  index: number;
  durationMs: number;
  cumulativeMs: number;
}

export interface TeleprompterState {
  isPlaying: boolean;
  currentWordIndex: number;
  speedPreset: SpeedPreset;
  elapsedMs: number;
  isMirrored: boolean;
  isFullscreen: boolean;
}

export type TeleprompterAction =
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "RESTART" }
  | { type: "TICK"; deltaMs: number; wordCount: number }
  | { type: "SET_SPEED"; preset: SpeedPreset }
  | { type: "SEEK_WORD"; index: number }
  | { type: "TOGGLE_MIRROR" }
  | { type: "SET_FULLSCREEN"; active: boolean };
