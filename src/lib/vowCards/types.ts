export interface DesignConfig {
  bgId: string;
  overlayColor: string;
  overlayOpacity: number;
  fontKey: FontKey;
  fontColor: string;
  format: CardFormat;
  brandMode: boolean;
}

export type FontKey = "serif" | "sans" | "script";

export type CardFormat = "card" | "booklet";

export interface BackgroundPreset {
  id: string;
  label: string;
  src: string;
  gradient: string;
}

export interface FontOption {
  key: FontKey;
  label: string;
  cssFamily: string;
  pdfFamily: string;
  pdfStyle: string;
}

export const FONT_OPTIONS: FontOption[] = [
  {
    key: "serif",
    label: "Classic",
    cssFamily: "'Noto Serif', 'Georgia', serif",
    pdfFamily: "times",
    pdfStyle: "normal",
  },
  {
    key: "sans",
    label: "Modern",
    cssFamily: "'Geist', 'Helvetica Neue', sans-serif",
    pdfFamily: "helvetica",
    pdfStyle: "normal",
  },
  {
    key: "script",
    label: "Handwritten",
    cssFamily: "'Georgia', 'Palatino', serif",
    pdfFamily: "times",
    pdfStyle: "italic",
  },
];

export const FORMAT_OPTIONS: { key: CardFormat; label: string; width: number; height: number }[] = [
  { key: "card", label: "Card (4×6)", width: 4, height: 6 },
  { key: "booklet", label: "Booklet (5.5×8.5)", width: 5.5, height: 8.5 },
];

export const DEFAULT_CONFIG: DesignConfig = {
  bgId: "garden",
  overlayColor: "#fffbf5",
  overlayOpacity: 0.82,
  fontKey: "serif",
  fontColor: "#1a1a1a",
  format: "card",
  brandMode: true,
};
